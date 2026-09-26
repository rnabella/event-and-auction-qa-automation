import { BasePage } from '../BasePage';

export class LoginPage extends BasePage {
  async open(): Promise<void> {
    await this.goto('/admin/login.html');
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.fill('#username', username);
    await this.page.fill('#password', password);
    await this.page.click('#login-form button[type="submit"]');
  }
}
