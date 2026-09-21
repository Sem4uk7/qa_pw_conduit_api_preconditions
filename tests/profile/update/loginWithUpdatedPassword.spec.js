import { test } from '../../_fixtures/fixtures';
import { EditProfileSettingsPage } from '../../../src/ui/pages/profile/EditProfileSettingsPage';
import { ViewUserProfilePage } from '../../../src/ui/pages/profile/ViewUserProfilePage';
import { SignInPage } from '../../../src/ui/pages/auth/SignInPage';
import { InternalHomePage } from '../../../src/ui/pages/home/InternalHomePage';

test('Login with new password after it was updated from settings', async ({
  loggedInUserAndPage,
  factories,
}) => {
  const page = loggedInUserAndPage.page;

  const user = loggedInUserAndPage.registeredUser;
  const editSettingsPage = new EditProfileSettingsPage(page);
  const viewUserProfilePage = new ViewUserProfilePage(page);
  const signInPage = new SignInPage(page);
  const internalHomePage = new InternalHomePage(page);

  const newPassword = factories.user.generatePassword();

  await editSettingsPage.open();
  await editSettingsPage.fillNewPasswordField(newPassword);
  await editSettingsPage.clickUpdateSettingsButton();
  await viewUserProfilePage.clickEditProfileSettingsLink();
  await editSettingsPage.clickLogoutButton();
  await signInPage.open();
  await signInPage.fillEmailField(user.email);
  await signInPage.fillPasswordField(newPassword);
  await signInPage.clickSignInButton();
  await internalHomePage.yourFeed.assertTabLinkVisible();
});
