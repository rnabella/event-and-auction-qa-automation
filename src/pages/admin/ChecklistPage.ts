import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ChecklistPage extends BasePage {
  async open(): Promise<void> {
    await this.goto('/admin/checklist.html');
  }

  item(itemId: string): Locator {
    return this.page.locator(`#checklist-item-${itemId}`);
  }
}
