import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

export type BillRecord = {
  id: string;
  createdAt: string;
  title: string;
  html: string;
};

@Injectable({ providedIn: 'root' })
export class BillHistoryService {
  private readonly auth = inject(AuthService);
  private readonly storageKeyPrefix = 'sln-billing-recent-bills';

  getBills(): BillRecord[] {
    const raw = localStorage.getItem(this.getStorageKey());

    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as BillRecord[];
    } catch {
      return [];
    }
  }

  saveBill(html: string, title?: string): BillRecord {
    const bills = this.getBills();
    const now = new Date();
    const bill: BillRecord = {
      id: `${now.getTime()}`,
      createdAt: now.toLocaleString(),
      title: title || `Bill ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
      html
    };

    bills.unshift(bill);
    localStorage.setItem(this.getStorageKey(), JSON.stringify(bills.slice(0, 25)));

    return bill;
  }

  deleteBill(id: string): BillRecord[] {
    const remainingBills = this.getBills().filter((bill) => bill.id !== id);
    localStorage.setItem(this.getStorageKey(), JSON.stringify(remainingBills));

    return remainingBills;
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
      billWindow.print();
    }
  }

  private getStorageKey(): string {
    const currentUser = this.auth.getCurrentUser();
    if (currentUser) {
      return `${this.storageKeyPrefix}:${currentUser}`;
    }

    const token = this.auth.getToken();
    return token
      ? `${this.storageKeyPrefix}:${token}`
      : `${this.storageKeyPrefix}:guest`;
  }
}
