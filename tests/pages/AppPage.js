import BasePage from './BasePage.js';
import constants from '../utils/constants.js';

class AppPage extends BasePage {
  constructor(page) {
    super(page);
  }

  get signInButton() {
    // "Sign in" label may differ in casing between environments
    return this.page.getByRole('button', { name: /sign in/i });
  }

  get welcomeText() {
    return this.page.getByText(constants.mainPageElements.welcomeText);
  }

  get dashboardLink() {
    return this.page.locator(`a:has-text("${constants.mainPageElements.dashboardMenuItemLabel}")`).first();
  }

  get profileButton() {
    // Name can vary, but in fixtures it's usually present as a button with user name
    return this.page.getByRole('button', { name: /jane doe|profile/i }).first();
  }

  get usernameField() {
    return this.page.getByLabel(constants.authElements.usernameLabel);
  }

  get usernameText() {
    return this.page.getByText(new RegExp(constants.authElements.usernameLabel, 'i')).first();
  }

  get passwordText() {
    return this.page.getByText(new RegExp(constants.authElements.passwordLabel, 'i')).first();
  }

  get loginRequiredAlert() {
    return this.page.locator('[role="alert"]').filter({ hasText: /please login/i }).first();
  }

  async waitForAppLoad(timeout = 15000) {
    // IMPORTANT: Use Promise.any (not Promise.race). race rejects as soon as the first awaited
    // promise rejects (e.g. a timeout), which can fail the wait even if other anchors could appear.
    // #region agent log
    const __agentLog = (hypothesisId, message, data) =>
      fetch('http://127.0.0.1:7242/ingest/297a5197-2662-41e3-9da1-d4b51aedc13e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'pre-fix',
          hypothesisId,
          location: 'tests/pages/AppPage.js:waitForAppLoad',
          message,
          data,
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    // #endregion

    try {
      // #region agent log
      __agentLog('A', 'enter', { timeout, url: this.page.url() });
      // #endregion

      // #region agent log
      const pre = {
        url: this.page.url(),
        title: await this.page.title().catch(() => ''),
        signIn: await this.signInButton.isVisible({ timeout: 300 }).catch(() => false),
        usernameField: await this.usernameField.isVisible({ timeout: 300 }).catch(() => false),
        usernameText: await this.usernameText.isVisible({ timeout: 300 }).catch(() => false),
        passwordText: await this.passwordText.isVisible({ timeout: 300 }).catch(() => false),
        loginAlert: await this.loginRequiredAlert.isVisible({ timeout: 300 }).catch(() => false),
        welcome: await this.welcomeText.isVisible({ timeout: 300 }).catch(() => false),
        dashboard: await this.dashboardLink.isVisible({ timeout: 300 }).catch(() => false),
        profile: await this.profileButton.isVisible({ timeout: 300 }).catch(() => false),
      };
      __agentLog('B', 'pre-anchors-visible', pre);
      // #endregion

      await Promise.any([
        // Login page anchors (can vary by implementation)
        this.signInButton.waitFor({ state: 'visible', timeout }),
        this.usernameField.waitFor({ state: 'visible', timeout }),
        this.usernameText.waitFor({ state: 'visible', timeout }),
        this.passwordText.waitFor({ state: 'visible', timeout }),
        this.loginRequiredAlert.waitFor({ state: 'visible', timeout }),

        // Logged-in app anchors
        this.welcomeText.waitFor({ state: 'visible', timeout }),
        this.dashboardLink.waitFor({ state: 'visible', timeout }),
        this.profileButton.waitFor({ state: 'visible', timeout }),
      ]);

      // #region agent log
      const post = {
        url: this.page.url(),
        title: await this.page.title().catch(() => ''),
        signIn: await this.signInButton.isVisible({ timeout: 300 }).catch(() => false),
        usernameField: await this.usernameField.isVisible({ timeout: 300 }).catch(() => false),
        usernameText: await this.usernameText.isVisible({ timeout: 300 }).catch(() => false),
        passwordText: await this.passwordText.isVisible({ timeout: 300 }).catch(() => false),
        loginAlert: await this.loginRequiredAlert.isVisible({ timeout: 300 }).catch(() => false),
        welcome: await this.welcomeText.isVisible({ timeout: 300 }).catch(() => false),
        dashboard: await this.dashboardLink.isVisible({ timeout: 300 }).catch(() => false),
        profile: await this.profileButton.isVisible({ timeout: 300 }).catch(() => false),
      };
      __agentLog('C', 'success-post-anchors-visible', post);
      // #endregion
    } catch (_error) {
      // #region agent log
      __agentLog('D', 'failed', {
        url: this.page.url(),
        title: await this.page.title().catch(() => ''),
        errorName: _error?.name,
        errorMessage: _error?.message,
      });
      // #endregion

      // #region agent log
      // Fallback runtime evidence in CI logs (in case debug log sink is unavailable)
      try {
        const snapshot = {
          url: this.page.url(),
          title: await this.page.title().catch(() => ''),
          signIn: await this.signInButton.isVisible({ timeout: 300 }).catch(() => false),
          usernameField: await this.usernameField.isVisible({ timeout: 300 }).catch(() => false),
          usernameText: await this.usernameText.isVisible({ timeout: 300 }).catch(() => false),
          passwordText: await this.passwordText.isVisible({ timeout: 300 }).catch(() => false),
          loginAlert: await this.loginRequiredAlert.isVisible({ timeout: 300 }).catch(() => false),
          welcome: await this.welcomeText.isVisible({ timeout: 300 }).catch(() => false),
          dashboard: await this.dashboardLink.isVisible({ timeout: 300 }).catch(() => false),
          profile: await this.profileButton.isVisible({ timeout: 300 }).catch(() => false),
        };
        // eslint-disable-next-line no-console
        console.log(`[app-load] failed snapshot=${JSON.stringify(snapshot)}`);
      } catch (_e) {
        // eslint-disable-next-line no-console
        console.log('[app-load] failed snapshot=<unavailable>');
      }
      // #endregion

      const url = this.page.url();
      const title = await this.page.title().catch(() => '');
      const bodyText = await this.page.textContent('body').catch(() => '');
      const snippet = (bodyText || '').replace(/\s+/g, ' ').slice(0, 200);
      throw new Error(`App did not reach a known stable UI state in ${timeout}ms. url="${url}" title="${title}" bodySnippet="${snippet}"`);
    }
  }

  async isAppLoaded() {
    return (
      await this.signInButton.isVisible().catch(() => false) ||
      await this.usernameField.isVisible().catch(() => false) ||
      await this.usernameText.isVisible().catch(() => false) ||
      await this.passwordText.isVisible().catch(() => false) ||
      await this.loginRequiredAlert.isVisible().catch(() => false) ||
      await this.welcomeText.isVisible().catch(() => false) ||
      await this.dashboardLink.isVisible().catch(() => false) ||
      await this.profileButton.isVisible().catch(() => false)
    );
  }
}

export default AppPage;