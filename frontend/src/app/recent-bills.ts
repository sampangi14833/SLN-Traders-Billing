import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BillHistoryService } from './bill-history.service';

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

  protected viewBill(html: string): void {
    this.billHistory.openBill(html, false);
  }

  protected downloadBill(html: string): void {
    this.billHistory.openBill(html, true);
  }

  protected deleteBill(id: string): void {
    this.bills = this.billHistory.deleteBill(id);
  }
}
