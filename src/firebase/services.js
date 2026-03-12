// Firestore service layer for all database operations
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, getDoc, query, where, orderBy, limit,
  serverTimestamp, onSnapshot, writeBatch, increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';

// ─── PRODUCTS ───────────────────────────────────────────────────────────────

export const productsRef = () => collection(db, 'products');

export async function getProducts() {
  const snap = await getDocs(query(productsRef(), orderBy('name')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeProducts(callback) {
  return onSnapshot(query(productsRef(), orderBy('name')), snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function addProduct(data) {
  return addDoc(productsRef(), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function updateProduct(id, data) {
  return updateDoc(doc(db, 'products', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteProduct(id) {
  return deleteDoc(doc(db, 'products', id));
}

export async function uploadProductImage(file, productId) {
  const r = ref(storage, `products/${productId}/${file.name}`);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}

// ─── TRANSACTIONS ────────────────────────────────────────────────────────────

export const transactionsRef = () => collection(db, 'transactions');

export async function createTransaction(data) {
  const batch = writeBatch(db);

  // Deduct stock for each item
  for (const item of data.items) {
    const pRef = doc(db, 'products', item.productId);
    batch.update(pRef, { stock: increment(-item.quantity) });
  }

  // Create transaction record
  const txRef = doc(transactionsRef());
  batch.set(txRef, {
    ...data,
    createdAt: serverTimestamp(),
    date: new Date().toISOString().split('T')[0]
  });

  await batch.commit();
  return txRef.id;
}

export async function getTransactions(dateFilter = null) {
  let q = query(transactionsRef(), orderBy('createdAt', 'desc'));
  if (dateFilter) {
    q = query(transactionsRef(), where('date', '==', dateFilter), orderBy('createdAt', 'desc'));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeTransactions(callback, dateFilter = null) {
  let q = query(transactionsRef(), orderBy('createdAt', 'desc'), limit(50));
  if (dateFilter) {
    q = query(transactionsRef(), where('date', '==', dateFilter), orderBy('createdAt', 'desc'));
  }
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function getTransactionById(id) {
  const snap = await getDoc(doc(db, 'transactions', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ─── CUSTOMERS ───────────────────────────────────────────────────────────────

export const customersRef = () => collection(db, 'customers');

export async function getCustomers() {
  const snap = await getDocs(query(customersRef(), orderBy('name')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeCustomers(callback) {
  return onSnapshot(query(customersRef(), orderBy('name')), snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function addCustomer(data) {
  return addDoc(customersRef(), { ...data, totalSpent: 0, transactionCount: 0, createdAt: serverTimestamp() });
}

export async function updateCustomer(id, data) {
  return updateDoc(doc(db, 'customers', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteCustomer(id) {
  return deleteDoc(doc(db, 'customers', id));
}

export async function updateCustomerStats(customerId, amount) {
  if (!customerId) return;
  const ref = doc(db, 'customers', customerId);
  return updateDoc(ref, {
    totalSpent: increment(amount),
    transactionCount: increment(1),
    lastVisit: serverTimestamp()
  });
}

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

export const CATEGORIES = [
  'Electronics', 'Grocery', 'Beverages', 'Dairy', 'Bakery',
  'Meat & Seafood', 'Household', 'Personal Care', 'Clothing',
  'Stationery', 'Toys', 'Health', 'Other'
];
