import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { Facility, FacilityMonthlyData, AuditLog } from '../types';
import { INITIAL_FACILITIES } from '../data/mockDhims2Data';

const FACILITIES_COLLECTION = 'facilities';
const MONTHLY_RECORDS_COLLECTION = 'monthly_records';
const AUDIT_LOGS_COLLECTION = 'audit_logs';

/**
 * Initializes facilities in Firestore if the collection is currently empty
 */
export async function seedLiveFacilitiesIfEmpty(fallbackFacilities: Facility[] = INITIAL_FACILITIES): Promise<Facility[]> {
  try {
    const facilitiesRef = collection(db, FACILITIES_COLLECTION);
    const snapshot = await getDocs(facilitiesRef);
    if (snapshot.empty) {
      console.log('Seeding initial sub-district facilities to live Firestore...');
      for (const fac of fallbackFacilities) {
        const facDocRef = doc(db, FACILITIES_COLLECTION, fac.id);
        await setDoc(facDocRef, {
          ...fac,
          updatedAt: new Date().toISOString(),
        });
      }
      return fallbackFacilities;
    } else {
      const liveFacilities: Facility[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Facility;
        liveFacilities.push({ ...data, id: docSnap.id });
      });
      return liveFacilities;
    }
  } catch (error) {
    console.error('Error seeding/checking live facilities in Firestore:', error);
    return fallbackFacilities;
  }
}

/**
 * Subscribe to live facilities updates
 */
export function subscribeLiveFacilities(
  onData: (facilities: Facility[]) => void,
  onError?: (error: Error) => void
) {
  const facilitiesRef = collection(db, FACILITIES_COLLECTION);
  return onSnapshot(
    facilitiesRef,
    (snapshot) => {
      if (snapshot.empty) {
        onData(INITIAL_FACILITIES);
      } else {
        const facList: Facility[] = [];
        snapshot.forEach((docSnap) => {
          facList.push({ ...(docSnap.data() as Facility), id: docSnap.id });
        });
        onData(facList);
      }
    },
    (err) => {
      console.error('Firestore facilities subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save / update a facility definition and catchment target in Firestore
 */
export async function saveLiveFacility(facility: Facility): Promise<void> {
  const facDocRef = doc(db, FACILITIES_COLLECTION, facility.id);
  await setDoc(
    facDocRef,
    {
      ...facility,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * Subscribe to live monthly records in Firestore
 */
export function subscribeLiveMonthlyRecords(
  onData: (records: FacilityMonthlyData[]) => void,
  onError?: (error: Error) => void
) {
  const recordsRef = collection(db, MONTHLY_RECORDS_COLLECTION);
  return onSnapshot(
    recordsRef,
    (snapshot) => {
      const records: FacilityMonthlyData[] = [];
      snapshot.forEach((docSnap) => {
        const raw = docSnap.data() as FacilityMonthlyData;
        records.push({
          ...raw,
          dataSource: 'actual',
          isSample: false,
        });
      });
      onData(records);
    },
    (err) => {
      console.error('Firestore monthly records subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save a live monthly record into Firestore
 * Document ID structure: ${facilityId}_${year}_${month}
 */
export async function saveLiveMonthlyRecord(record: FacilityMonthlyData, userEmail = 'officer@ghs.gov.gh'): Promise<string> {
  const recordId = `${record.facilityId}_${record.year}_${record.month}`;
  const docRef = doc(db, MONTHLY_RECORDS_COLLECTION, recordId);
  
  const payload: FacilityMonthlyData = {
    ...record,
    dataSource: 'actual',
    isSample: false,
    submittedDate: record.submittedDate || new Date().toISOString().split('T')[0],
  };

  await setDoc(docRef, {
    ...payload,
    updatedAt: new Date().toISOString(),
    submittedBy: userEmail,
  });

  // Also log audit trail in Firestore
  try {
    const auditId = `audit_${Date.now()}`;
    const auditRef = doc(db, AUDIT_LOGS_COLLECTION, auditId);
    await setDoc(auditRef, {
      id: auditId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      fileName: `Manual Entry / Edit (${record.facilityName})`,
      userRole: 'Health Officer / M&E Admin',
      uploadedBy: userEmail,
      period: record.monthLabel,
      recordsProcessed: 1,
      status: 'Success',
      details: `Live record for ${record.facilityName} (${record.monthLabel}) committed to Firestore Cloud Database.`,
    });
  } catch (auditErr) {
    console.warn('Could not write audit log to Firestore:', auditErr);
  }

  return recordId;
}

/**
 * Batch save imported DHIMS2 live records into Firestore
 */
export async function saveLiveMonthlyRecordsBatch(
  records: FacilityMonthlyData[],
  fileName = 'DHIMS2_Batch_Import',
  userEmail = 'officer@ghs.gov.gh'
): Promise<number> {
  let count = 0;
  for (const rec of records) {
    const recordId = `${rec.facilityId}_${rec.year}_${rec.month}`;
    const docRef = doc(db, MONTHLY_RECORDS_COLLECTION, recordId);
    await setDoc(docRef, {
      ...rec,
      dataSource: 'actual',
      isSample: false,
      updatedAt: new Date().toISOString(),
      submittedBy: userEmail,
    });
    count++;
  }

  try {
    const auditId = `audit_${Date.now()}`;
    const auditRef = doc(db, AUDIT_LOGS_COLLECTION, auditId);
    await setDoc(auditRef, {
      id: auditId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      fileName,
      userRole: 'M&E Officer',
      uploadedBy: userEmail,
      period: records.length > 0 ? records[0].monthLabel : 'Multiple Periods',
      recordsProcessed: count,
      status: 'Success',
      details: `Batch imported ${count} validated DHIMS2 actual record(s) to Firestore Cloud DB.`,
    });
  } catch (err) {
    console.warn('Audit log write error:', err);
  }

  return count;
}

/**
 * Delete a specific monthly record from Firestore
 */
export async function deleteLiveMonthlyRecord(facilityId: string, year: number, month: number): Promise<void> {
  const recordId = `${facilityId}_${year}_${month}`;
  const docRef = doc(db, MONTHLY_RECORDS_COLLECTION, recordId);
  await deleteDoc(docRef);
}

/**
 * Subscribe to live audit logs from Firestore
 */
export function subscribeLiveAuditLogs(
  onData: (logs: AuditLog[]) => void,
  onError?: (error: Error) => void
) {
  const logsRef = collection(db, AUDIT_LOGS_COLLECTION);
  return onSnapshot(
    logsRef,
    (snapshot) => {
      const logs: AuditLog[] = [];
      snapshot.forEach((docSnap) => {
        logs.push(docSnap.data() as AuditLog);
      });
      // Sort newest first
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onData(logs);
    },
    (err) => {
      console.error('Firestore audit logs subscription error:', err);
      if (onError) onError(err);
    }
  );
}
