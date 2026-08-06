import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

export type BillRecord = {
  id: string;
  createdAt: string;
  title: string;
  html: string;
  billDate?: string;
  lorryNumber?: string;
};

type SaveBillOptions = {
  title?: string;
  billDate?: string;
  lorryNumber?: string;
};

type StoredBills = Record<string, BillRecord[]>;

@Injectable({ providedIn: 'root' })
export class BillHistoryService {
  private readonly auth = inject(AuthService);
  private readonly storageKey = 'sln-traders-billing.bills.v1';
  private readonly maxBillsPerUser = 50;
  private readonly billsByUser = new Map<string, BillRecord[]>();

  constructor() {
    this.restoreBills();
  }

  getBills(): BillRecord[] {
    return this.getCurrentUserBills().map((bill) => ({ ...bill }));
  }

  saveBill(html: string, options?: SaveBillOptions): BillRecord {
    const bills = this.getCurrentUserBills();
    const now = new Date();
    const title = options?.title?.trim();
    const billDate = options?.billDate?.trim() || this.getTodayDateValue(now);
    const lorryNumber = options?.lorryNumber?.trim() || '';
    const bill: BillRecord = {
      id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: now.toLocaleString('en-IN'),
      title: title || `Bill ${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString('en-IN')}`,
      html,
      billDate,
      lorryNumber
    };

    this.billsByUser.set(this.getCurrentUserKey(), [bill, ...bills].slice(0, this.maxBillsPerUser));
    this.persistBills();

    return bill;
  }

  deleteBill(id: string): BillRecord[] {
    const remainingBills = this.getCurrentUserBills().filter((bill) => bill.id !== id);
    this.billsByUser.set(this.getCurrentUserKey(), remainingBills);
    this.persistBills();

    return remainingBills.map((bill) => ({ ...bill }));
  }

  openBill(html: string, print: boolean): void {
    const billWindow = window.open('', '_blank', 'width=1200,height=900');

    if (!billWindow) {
      return;
    }

    billWindow.document.open();
    billWindow.document.write(html);
    billWindow.document.close();
    billWindow.focus();

    if (print) {
      let printed = false;
      const printBill = () => {
        if (printed) {
          return;
        }

        printed = true;
        billWindow.focus();
        billWindow.print();
      };

      billWindow.addEventListener('load', () => billWindow.setTimeout(printBill, 150), {
        once: true
      });
      billWindow.setTimeout(printBill, 900);
    }
  }

  downloadBill(bill: BillRecord): void {
    const blob = new Blob([bill.html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${this.getSafeFileName(bill.title)}.html`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  private getCurrentUserKey(): string {
    const currentUser = this.auth.getCurrentUser();

    return currentUser ?? 'guest';
  }

  private getCurrentUserBills(): BillRecord[] {
    return this.billsByUser.get(this.getCurrentUserKey()) ?? [];
  }

  private restoreBills(): void {
    const storage = this.getStorage();

    if (!storage) {
      return;
    }

    try {
      const rawBills = storage.getItem(this.storageKey);

      if (!rawBills) {
        return;
      }

      const storedBills = JSON.parse(rawBills) as StoredBills;
      Object.entries(storedBills).forEach(([userKey, bills]) => {
        if (Array.isArray(bills)) {
          this.billsByUser.set(userKey, bills.filter(this.isBillRecord));
        }
      });
    } catch {
      this.billsByUser.clear();
    }
  }

  private persistBills(): void {
    const storage = this.getStorage();

    if (!storage) {
      return;
    }

    try {
      storage.setItem(this.storageKey, JSON.stringify(Object.fromEntries(this.billsByUser)));
    } catch {
      // Local storage can be disabled or full; current-tab bill history still remains available.
    }
  }

  private getStorage(): Storage | null {
    try {
      return typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
      return null;
    }
  }

  private isBillRecord(value: unknown): value is BillRecord {
    const bill = value as Partial<BillRecord>;

    return Boolean(
      bill &&
        typeof bill.id === 'string' &&
        typeof bill.createdAt === 'string' &&
        typeof bill.title === 'string' &&
        typeof bill.html === 'string'
    );
  }

  private getTodayDateValue(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private getSafeFileName(value: string): string {
    const safeName = value
      .trim()
      .replace(/[^a-z0-9_-]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);

    return safeName || 'sln-bill';
  }
}
