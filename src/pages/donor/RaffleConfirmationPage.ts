import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class RaffleConfirmationPage extends BasePage {
  get message(): Locator {
    return this.page.locator('#confirmation-message');
  }
}
