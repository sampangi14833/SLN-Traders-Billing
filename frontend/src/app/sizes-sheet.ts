import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BillHistoryService } from './bill-history.service';

type StoneRow = {
  size: string;
  length: number;
  width: number;
  stoneExpression: string;
};

type WidthGroup = 2 | 1.5 | 1 | 9 | 1.25 | 6;

@Component({
  selector: 'app-sizes-sheet',
  standalone: true,
  imports: [DecimalPipe, FormsModule, RouterLink],
  templateUrl: './sizes-sheet.html',
  styleUrl: './sizes-sheet.css'
})
export class SizesSheet {
  private readonly billHistory = inject(BillHistoryService);
  protected activeSizeGroup: 'large' | 'small' | null = null;
  protected showGeneratedBill = false;
  protected billName = '';
  protected lorryNumber = '';
  protected readonly largeRows: StoneRow[] = [
    this.createRow('3 X 2', 3, 2),
    this.createRow('3.5 X 2', 3.5, 2),
    this.createRow('4 X 2', 4, 2),
    this.createRow('4.5 X 2', 4.5, 2),
    this.createRow('5 X 2', 5, 2),
    this.createRow('5.5 X 2', 5.5, 2),
    this.createRow('6 X 2', 6, 2),
    this.createRow('6.5 X 2', 6.5, 2),
    this.createRow('7 X 2', 7, 2),
    this.createRow('7.5 X 2', 7.5, 2),
    this.createRow('8 X 2', 8, 2),
    this.createRow('3 X 1.5', 3, 1.5),
    this.createRow('3.5 X 1.5', 3.5, 1.5),
    this.createRow('4 X 1.5', 4, 1.5),
    this.createRow('4.5 X 1.5', 4.5, 1.5),
    this.createRow('5 X 1.5', 5, 1.5),
    this.createRow('5.5 X 1.5', 5.5, 1.5),
    this.createRow('6 X 1.5', 6, 1.5),
    this.createRow('6.5 X 1.5', 6.5, 1.5),
    this.createRow('7 X 1.5', 7, 1.5),
    this.createRow('7.5 X 1.5', 7.5, 1.5),
    this.createRow('8 X 1.5', 8, 1.5),
    this.createRow('3 X 1', 3, 1),
    this.createRow('3.5 X 1', 3.5, 1),
    this.createRow('4 X 1', 4, 1),
    this.createRow('4.5 X 1', 4.5, 1),
    this.createRow('5 X 1', 5, 1),
    this.createRow('5.5 X 1', 5.5, 1),
    this.createRow('6 X 1', 6, 1),
    this.createRow('6.5 X 1', 6.5, 1),
    this.createRow('7 X 1', 7, 1),
    this.createRow('7.5 X 1', 7.5, 1),
    this.createRow('8 X 1', 8, 1)
  ];

  protected readonly smallRows: StoneRow[] = [
    this.createRow('3 X 9', 3, 9),
    this.createRow('3.5 X 9', 3.5, 9),
    this.createRow('4 X 9', 4, 9),
    this.createRow('4.5 X 9', 4.5, 9),
    this.createRow('5 X 9', 5, 9),
    this.createRow('5.5 X 9', 5.5, 9),
    this.createRow('6 X 9', 6, 9),
    this.createRow('6.5 X 9', 6.5, 9),
    this.createRow('7 X 9', 7, 9),
    this.createRow('7.5 X 9', 7.5, 9),
    this.createRow('8 X 9', 8, 9),
    this.createRow('3 X 1.25', 3, 1.25),
    this.createRow('3.5 X 1.25', 3.5, 1.25),
    this.createRow('4 X 1.25', 4, 1.25),
    this.createRow('4.5 X 1.25', 4.5, 1.25),
    this.createRow('5 X 1.25', 5, 1.25),
    this.createRow('5.5 X 1.25', 5.5, 1.25),
    this.createRow('6 X 1.25', 6, 1.25),
    this.createRow('6.5 X 1.25', 6.5, 1.25),
    this.createRow('7 X 1.25', 7, 1.25),
    this.createRow('7.5 X 1.25', 7.5, 1.25),
    this.createRow('8 X 1.25', 8, 1.25),
        this.createRow('3 X 6', 3, 6),
    this.createRow('3.5 X 6', 3.5, 6),
    this.createRow('4 X 6', 4, 6),
    this.createRow('4.5 X 6', 4.5, 6),
    this.createRow('5 X 6', 5, 6),
    this.createRow('5.5 X 6', 5.5, 6),
    this.createRow('6 X 6', 6, 6),
    this.createRow('6.5 X 6', 6.5, 6),
    this.createRow('7 X 6', 7, 6),
    this.createRow('7.5 X 6', 7.5, 6),
    this.createRow('8 X 6', 8, 6)
  ];

  protected getStoneCount(row: StoneRow): number {
    if (!row.stoneExpression.trim()) {
      return 0;
    }

    return row.stoneExpression
      .split('+')
      .map((value) => Number(value.trim()))
      .filter((value) => !Number.isNaN(value))
      .reduce((sum, value) => sum + value, 0);
  }

  protected getSizeArea(row: StoneRow): number {
    if (row.width === 6) {
      return row.length * 0.75;
    }

    if (this.smallRows.includes(row) && row.width === 9) {
      return row.length * 1;
    }

    return row.length * row.width;
  }

  protected getTotalArea(row: StoneRow): number {
    return this.getSizeArea(row) * this.getStoneCount(row);
  }

  protected getLargeTotalStones(): number {
    return this.largeRows.reduce((sum, row) => sum + this.getStoneCount(row), 0);
  }

  protected getLargeTotalArea(): number {
    return this.largeRows.reduce((sum, row) => sum + this.getTotalArea(row), 0);
  }

  protected getSmallTotalStones(): number {
    return this.smallRows.reduce((sum, row) => sum + this.getStoneCount(row), 0);
  }

  protected getSmallTotalArea(): number {
    return this.smallRows.reduce((sum, row) => sum + this.getTotalArea(row), 0);
  }

  protected getGeneratedTotalStones(): number {
    return this.getLargeTotalStones() + this.getSmallTotalStones();
  }

  protected getGeneratedTotalArea(): number {
    return this.getLargeTotalArea() + this.getSmallTotalArea();
  }

  protected getRowsForWidth(width: WidthGroup): StoneRow[] {
    if (width === 9 || width === 1.25 || width === 6) {
      return this.smallRows.filter((row) => row.width === width);
    }

    return this.largeRows.filter((row) => row.width === width);
  }

  protected getWidthGroupTotalStones(width: WidthGroup): number {
    return this.getRowsForWidth(width).reduce((sum, row) => sum + this.getStoneCount(row), 0);
  }

  protected getWidthGroupTotalArea(width: WidthGroup): number {
    return this.getRowsForWidth(width).reduce((sum, row) => sum + this.getTotalArea(row), 0);
  }

  protected getPdfTotalStones(): number {
    return [2, 1.5, 1, 9, 1.25, 6].reduce(
      (sum, width) => sum + this.getWidthGroupTotalStones(width as WidthGroup),
      0
    );
  }

  protected getPdfTotalArea(): number {
    return [2, 1.5, 1, 9, 1.25, 6].reduce(
      (sum, width) => sum + this.getWidthGroupTotalArea(width as WidthGroup),
      0
    );
  }

  protected openLargeSize(): void {
    this.activeSizeGroup = 'large';
    this.showGeneratedBill = false;
  }

  protected openSmallSize(): void {
    this.activeSizeGroup = 'small';
    this.showGeneratedBill = false;
  }

  protected generateBill(): void {
    this.activeSizeGroup = null;
    this.showGeneratedBill = true;
  }

  protected submitBill(): void {
    const html = this.buildBillHtml();
    this.billHistory.saveBill(html, this.billName.trim());
    this.billHistory.openBill(html, true);
  }

  private buildBillHtml(): string {
    const sections: WidthGroup[] = [2, 1.5, 1, 9, 1.25, 6];
    const tablesMarkup = sections
      .map((width) => {
        const label = `${width} Width`;
        const rows = this.getRowsForWidth(width)
          .map((row) => {
            const expression = row.stoneExpression.trim() || '-';
            const stones = this.getStoneCount(row);
            const area = this.getTotalArea(row).toFixed(2);

            return `
              <tr>
                <td>${row.size}</td>
                <td>${expression}</td>
                <td>${stones}</td>
                <td>${area}</td>
              </tr>
            `;
          })
          .join('');

        return `
          <section class="bill-grid__item">
            <h2>${label}</h2>
            <table>
              <thead>
                <tr>
                  <th>Size</th>
                  <th>No.of Stones</th>
                  <th>Stones Count</th>
                  <th>Total Area</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <div class="subtotal">
              <p><strong>Total Stones:</strong> ${this.getWidthGroupTotalStones(width)}</p>
              <p><strong>Total Area:</strong> ${this.getWidthGroupTotalArea(width).toFixed(2)}</p>
            </div>
          </section>
        `;
      })
      .join('');

    return `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>SLN Billing Bill</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 24px;
              font-family: "Trebuchet MS", "Segoe UI", Tahoma, sans-serif;
              color: #2f2419;
            }
            h1 {
              margin: 0 0 8px;
              font-size: 28px;
            }
            .bill-name {
              margin: 0 0 16px;
              font-size: 18px;
              color: #7d441d;
              font-weight: 700;
            }
            .bill-meta {
              margin: 0 0 10px;
              font-size: 16px;
              color: #6f5a45;
              font-weight: 700;
            }
            .intro {
              margin: 0 0 20px;
              color: #6f5a45;
            }
            .bill-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 18px;
            }
            .bill-grid__item {
              border: 1px solid #d9c5b0;
              border-radius: 12px;
              padding: 14px;
              break-inside: avoid;
            }
            .bill-grid__item h2 {
              margin: 0 0 10px;
              font-size: 20px;
              color: #7d441d;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }
            th, td {
              padding: 8px;
              border: 1px solid #e4d6c7;
              text-align: left;
            }
            th {
              background: #f7efe6;
            }
            .subtotal, .grand-totals {
              margin-top: 12px;
            }
            .subtotal p, .grand-totals p {
              margin: 4px 0;
            }
            .grand-totals {
              margin-top: 24px;
              padding: 16px;
              border-radius: 12px;
              background: #f8f0e7;
              font-size: 16px;
            }
            @media (max-width: 900px) {
              body { padding: 16px; }
              .bill-grid { grid-template-columns: 1fr; }
            }
            @media print {
              body { padding: 12px; }
            }
          </style>
        </head>
        <body>
          <h1>SNL Enterprises</h1>
          <p class="bill-name"><strong>Bill Name:</strong> ${this.billName.trim() || 'Untitled Bill'}</p>
          <p class="bill-meta"><strong>Lorry Number:</strong> ${this.lorryNumber.trim() || '-'}</p>
          <p class="intro">Widths 2, 1.5, 1, 9, 1.25 and 6 are shown below.</p>
          <div class="bill-grid">${tablesMarkup}</div>
          <div class="grand-totals">
            <p><strong>Total Stones:</strong> ${this.getPdfTotalStones()}</p>
            <p><strong>Total Area:</strong> ${this.getPdfTotalArea().toFixed(2)}</p>
          </div>
        </body>
      </html>
    `;
  }

  private createRow(size: string, length: number, width: number): StoneRow {
    return {
      size,
      length,
      width,
      stoneExpression: ''
    };
  }
}
