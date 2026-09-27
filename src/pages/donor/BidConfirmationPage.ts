import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class BidConfirmationPage extends BasePage {
  get message(): Locator {
    return this.page.locator('#confirmation-message');
  }
}
