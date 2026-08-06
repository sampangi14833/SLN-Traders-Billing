import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BillHistoryService, BillRecord } from './bill-history.service';

@Component({
  selector: 'app-recent-bills',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './recent-bills.html',
  styleUrl: './recent-bills.css'
})
export class RecentBills {
  private readonly billHistory = inject(BillHistoryService);

  protected bills = this.billHistory.getBills();

  protected formatBillDate(dateValue?: string): string {
    if (!dateValue?.trim()) {
      return '-';
    }

    const [year, month, day] = dateValue.split('-').map((value) => Number(value));
    if (!year || !month || !day) {
      return dateValue;
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(year, month - 1, day));
  }

  protected viewBill(html: string): void {
    this.billHistory.openBill(html, false);
  }

  protected downloadBill(bill: BillRecord): void {
    this.billHistory.downloadBill(bill);
  }

  protected deleteBill(id: string): void {
    this.bills = this.billHistory.deleteBill(id);
  }
}
