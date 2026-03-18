import { Injectable } from '@angular/core';

export type BillRecord = {
  id: string;
  createdAt: string;
  title: string;
  html: string;
};

@Injectable({ providedIn: 'root' })
export class BillHistoryService {
  private readonly storageKey = 'sln-billing-recent-bills';

  getBills(): BillRecord[] {
    const raw = localStorage.getItem(this.storageKey);

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
    localStorage.setItem(this.storageKey, JSON.stringify(bills.slice(0, 25)));

    return bill;
  }

  deleteBill(id: string): BillRecord[] {
    const remainingBills = this.getBills().filter((bill) => bill.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(remainingBills));

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
}
