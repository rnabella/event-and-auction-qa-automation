import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ConfirmationPage extends BasePage {
  get message(): Locator {
    return this.page.locator('#confirmation-message');
  }

  get totalRaised(): Locator {
    return this.page.locator('#total-raised');
  }

  async refreshTotal(): Promise<void> {
    await this.page.click('#refresh-total');
  }
}
