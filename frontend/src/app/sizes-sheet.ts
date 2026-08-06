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
type SizeGroup = 'large' | 'small';

type WidthOption = {
  label: string;
  value: WidthGroup;
};

type PrintableBillRow = {
  size: string;
  stones: number;
  area: string;
};

type PrintableBillSection = {
  label: string;
  rows: PrintableBillRow[];
};

@Component({
  selector: 'app-sizes-sheet',
  standalone: true,
  imports: [DecimalPipe, FormsModule, RouterLink],
  templateUrl: './sizes-sheet.html',
  styleUrl: './sizes-sheet.css'
})
export class SizesSheet {
  private readonly billHistory = inject(BillHistoryService);
  protected activeSizeGroup: SizeGroup | null = null;
  protected selectedLargeWidth: WidthGroup = 2;
  protected selectedSmallWidth: WidthGroup = 9;
  protected showGeneratedBill = false;
  protected billName = '';
  protected billDate = this.getTodayDateValue();
  protected lorryNumber = '';
  protected readonly largeWidthOptions: WidthOption[] = [
    { label: '2 Width', value: 2 },
    { label: '1.5 Width', value: 1.5 },
    { label: '1 Width', value: 1 }
  ];
  protected readonly smallWidthOptions: WidthOption[] = [
    { label: '9 Width', value: 9 },
    { label: '1.25 Width', value: 1.25 },
    { label: '6 Width', value: 6 }
  ];
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

  protected getActiveWidthOptions(): WidthOption[] {
    return this.activeSizeGroup === 'small' ? this.smallWidthOptions : this.largeWidthOptions;
  }

  protected getActiveWidth(): WidthGroup {
    return this.activeSizeGroup === 'small' ? this.selectedSmallWidth : this.selectedLargeWidth;
  }

  protected getActiveRows(): StoneRow[] {
    return this.getRowsForWidth(this.getActiveWidth());
  }

  protected getActiveWidthTotalStones(): number {
    return this.getWidthGroupTotalStones(this.getActiveWidth());
  }

  protected getActiveWidthTotalArea(): number {
    return this.getWidthGroupTotalArea(this.getActiveWidth());
  }

  protected getActiveSizeGroupLabel(): string {
    return this.activeSizeGroup === 'small' ? 'Small Sizes' : 'Large Sizes';
  }

  protected selectWidth(width: WidthGroup): void {
    if (this.activeSizeGroup === 'small') {
      this.selectedSmallWidth = width;
      return;
    }

    this.selectedLargeWidth = width;
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

    if (!this.billDate.trim()) {
      this.billDate = this.getTodayDateValue();
    }
  }

  protected submitBill(): void {
    const html = this.buildBillHtml();
    this.billHistory.saveBill(html, {
      title: this.billName,
      billDate: this.billDate,
      lorryNumber: this.lorryNumber
    });
    this.billHistory.openBill(html, true);
  }

  private buildBillHtml(): string {
    const sections = this.getPrintableBillSections();
    const maximumRows = Math.max(...sections.map((section) => section.rows.length), 0);
    const billDateLabel = this.formatBillDate(this.billDate);
    const billName = this.escapeHtml(this.billName.trim() || 'Untitled Bill');
    const lorryNumber = this.escapeHtml(this.lorryNumber.trim() || '-');
    const iconUrl = this.escapeHtml(this.getBillIconUrl());
    const printableGrid = sections.length
      ? this.buildPrintableGridMarkup(sections, maximumRows)
      : '<p class="empty-state">No stone entries were added for this bill.</p>';

    return `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>SLN Billing Bill</title>
          <style>
            * { box-sizing: border-box; }
            :root {
              --ink: #9b2f5d;
              --line: #9b2f5d;
              --paper: #fbfffe;
            }
            body {
              margin: 0;
              padding: clamp(4px, 1.6vw, 18px);
              background: #eef5f3;
              color: var(--ink);
              font-family: "Arial Narrow", Arial, sans-serif;
            }
            .bill-page {
              width: min(1120px, calc(100vw - 12px));
              margin: 0 auto;
              padding: clamp(6px, 1.6vw, 18px);
              background: var(--paper);
            }
            .brand-row {
              display: grid;
              grid-template-columns: clamp(74px, 13vw, 142px) minmax(0, 1fr) clamp(104px, 20vw, 220px);
              gap: clamp(4px, 1vw, 12px);
              align-items: start;
            }
            .logo-mark {
              display: flex;
              align-items: center;
              justify-content: center;
              height: clamp(46px, 7vw, 78px);
              overflow: hidden;
            }
            .bill-logo {
              width: 100%;
              height: 100%;
              object-fit: contain;
              object-position: center;
            }
            .brand-copy {
              text-align: center;
              min-width: 0;
            }
            h1 {
              margin: 0;
              font-size: clamp(13px, 3vw, 36px);
              line-height: 1;
              letter-spacing: 0.04em;
              font-weight: 900;
              white-space: nowrap;
            }
            .address,
            .prop {
              margin: 4px 0 0;
              font-size: clamp(8px, 1.45vw, 16px);
              font-weight: 800;
              letter-spacing: 0;
            }
            .prop {
              font-size: clamp(7px, 1.25vw, 14px);
            }
            .contact {
              margin-top: 4px;
              font-size: clamp(10px, 1.8vw, 20px);
              line-height: 1.25;
              font-weight: 900;
              min-width: 0;
            }
            .bill-meta-row {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: clamp(4px, 1vw, 12px);
              margin: clamp(7px, 1.25vw, 14px) 0 clamp(4px, 0.75vw, 8px);
              font-size: clamp(9px, 1.6vw, 18px);
              font-weight: 900;
            }
            .bill-meta-row span:nth-child(2) {
              text-align: center;
            }
            .bill-meta-row span:last-child {
              text-align: right;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }
            th, td {
              border: 2px solid var(--line);
              color: var(--ink);
              overflow: hidden;
              white-space: nowrap;
              line-height: 1;
            }
            th {
              height: clamp(15px, 2.5vw, 28px);
              padding: clamp(1px, 0.3vw, 3px) clamp(1px, 0.4vw, 4px);
              font-size: clamp(5.8px, 1.25vw, 14px);
              font-weight: 900;
              text-align: center;
              text-transform: uppercase;
            }
            td {
              height: clamp(16px, 2.75vw, 31px);
              padding: clamp(1px, 0.3vw, 3px) clamp(1px, 0.45vw, 5px);
              font-size: clamp(5.8px, 1.35vw, 15px);
              font-weight: 900;
              vertical-align: middle;
            }
            .size-cell {
              text-align: left;
            }
            .number-cell {
              text-align: center;
              font-size: clamp(5.6px, 1.25vw, 14px);
            }
            .empty-cell {
              color: transparent;
            }
            .total-row {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: clamp(4px, 1vw, 12px);
              margin-top: clamp(8px, 1.6vw, 18px);
              padding-top: clamp(4px, 0.75vw, 8px);
              border-top: 2px solid var(--line);
              font-size: clamp(9px, 1.6vw, 18px);
              font-weight: 900;
            }
            .total-row span:nth-child(2) {
              text-align: center;
            }
            .total-row span:last-child {
              text-align: right;
            }
            .empty-state {
              margin: 40px 0;
              padding: 24px;
              border: 2px solid var(--line);
              font-size: 22px;
              font-weight: 900;
              text-align: center;
            }
            @media (max-width: 900px) {
              .print-grid-wrap {
                overflow: hidden;
              }
              .address {
                display: none;
              }
            }
            @media (max-width: 520px) {
              .brand-row {
                grid-template-columns: clamp(64px, 20vw, 86px) minmax(0, 1fr) clamp(82px, 25vw, 108px);
              }
              .logo-mark {
                height: clamp(36px, 11vw, 48px);
              }
              h1 {
                font-size: clamp(10px, 2.75vw, 13px);
                line-height: 0.95;
                white-space: normal;
                overflow-wrap: anywhere;
              }
              .prop {
                font-size: clamp(6px, 1.9vw, 8px);
              }
              .contact {
                font-size: clamp(8px, 2.35vw, 10px);
                line-height: 1.1;
                text-align: right;
                overflow-wrap: anywhere;
              }
            }
            @media print {
              @page {
                size: A4 landscape;
                margin: 8mm;
              }
              body {
                padding: 0;
                background: #fff;
              }
              .bill-page {
                width: 100%;
                padding: 0;
              }
              th, td {
                border-width: 1.5px;
              }
            }
          </style>
        </head>
        <body>
          <div class="bill-page">
            <header class="brand-row">
              <div class="logo-mark">
                <img class="bill-logo" src="${iconUrl}" alt="SNL Billing" />
              </div>
              <div class="brand-copy">
                <h1>SNL ENTERPRISES</h1>
                <p class="address">Sreenivasulu and Nagalakshumamma Enterprises</p>
                <p class="prop">Bill Name: ${billName}</p>
              </div>
              <div class="contact">
                <div>CELL : 9849255291</div>
              </div>
            </header>
            <div class="bill-meta-row">
              <span>Lorry No : ${lorryNumber}</span>
              <span></span>
              <span>Date : ${billDateLabel}</span>
            </div>
            <div class="print-grid-wrap">${printableGrid}</div>
            <div class="total-row">
              <span>Total Stones : ${this.getPrintableTotalStones()}</span>
              <span>Total Area : ${this.getPrintableTotalArea().toFixed(2)}</span>
              <span></span>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getPrintableBillSections(): PrintableBillSection[] {
    const widths: WidthGroup[] = [2, 1.5, 1, 1.25, 9, 6];

    return widths
      .map((width) => ({
        label: this.getPrintableWidthLabel(width),
        rows: this.getRowsForWidth(width)
          .filter((row) => this.getStoneCount(row) >= 1)
          .map((row) => ({
            size: this.getPrintableSize(row),
            stones: this.getStoneCount(row),
            area: this.getTotalArea(row).toFixed(2)
          }))
      }))
      .filter((section) => section.rows.length > 0);
  }

  private buildPrintableGridMarkup(sections: PrintableBillSection[], maximumRows: number): string {
    const sectionWidth = 100 / sections.length;
    const sizeColumnWidth = sectionWidth * 0.45;
    const quantityColumnWidth = sectionWidth * 0.2;
    const areaColumnWidth = sectionWidth * 0.35;
    const columnGroup = sections
      .map(
        () => `
          <col class="size-col" style="width: ${sizeColumnWidth.toFixed(3)}%" />
          <col class="qty-col" style="width: ${quantityColumnWidth.toFixed(3)}%" />
          <col class="area-col" style="width: ${areaColumnWidth.toFixed(3)}%" />
        `
      )
      .join('');
    const headerCells = sections
      .map((section) => `<th colspan="3">${this.escapeHtml(section.label)}</th>`)
      .join('');
    const detailHeaderCells = sections
      .map(() => '<th>Size</th><th>Qty</th><th>Area</th>')
      .join('');
    const bodyRows = Array.from({ length: maximumRows }, (_, rowIndex) => {
      const cells = sections
        .map((section) => {
          const row = section.rows[rowIndex];

          if (!row) {
            return '<td class="empty-cell">&nbsp;</td><td class="empty-cell">&nbsp;</td><td class="empty-cell">&nbsp;</td>';
          }

          return `
            <td class="size-cell">${this.escapeHtml(row.size)}</td>
            <td class="number-cell">${row.stones}</td>
            <td class="number-cell">${row.area}</td>
          `;
        })
        .join('');

      return `<tr>${cells}</tr>`;
    }).join('');

    return `
      <table class="print-grid">
        <colgroup>${columnGroup}</colgroup>
        <thead>
          <tr>${headerCells}</tr>
          <tr>${detailHeaderCells}</tr>
        </thead>
        <tbody>${bodyRows}</tbody>
      </table>
    `;
  }

  private getPrintableTotalStones(): number {
    return [...this.largeRows, ...this.smallRows].reduce(
      (sum, row) => sum + this.getStoneCount(row),
      0
    );
  }

  private getPrintableTotalArea(): number {
    return [...this.largeRows, ...this.smallRows].reduce(
      (sum, row) => sum + this.getTotalArea(row),
      0
    );
  }

  private getPrintableWidthLabel(width: WidthGroup): string {
    return `${this.formatCompactMeasurement(width)} Width`;
  }

  private getPrintableSize(row: StoneRow): string {
    return `${this.formatCompactMeasurement(row.length)}X${this.formatCompactMeasurement(row.width)}`;
  }

  private formatCompactMeasurement(value: number): string {
    const whole = Math.floor(value);
    const fraction = Number((value - whole).toFixed(2));

    if (fraction === 0.5) {
      return `${whole}.5`;
    }

    if (fraction === 0.25) {
      return `${whole}.25`;
    }

    if (fraction === 0.75) {
      return `${whole}.75`;
    }

    return `${value}`;
  }

  private getBillIconUrl(): string {
    if (typeof window === 'undefined') {
      return '/icon.png';
    }

    return `${window.location.origin}/icon.png`;
  }

  private createRow(size: string, length: number, width: number): StoneRow {
    return {
      size,
      length,
      width,
      stoneExpression: ''
    };
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };

      return entities[character];
    });
  }

  private getTodayDateValue(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const day = `${now.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private formatBillDate(dateValue: string): string {
    if (!dateValue.trim()) {
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
}
