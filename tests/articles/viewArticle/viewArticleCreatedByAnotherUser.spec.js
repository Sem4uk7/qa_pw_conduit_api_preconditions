import { test } from '../../_fixtures/fixtures';
import { InternalViewArticlePage } from '../../../src/ui/pages/article/view/InternalViewArticlePage';
import { generateStorageStateForAuth } from '../../../src/common/helpers/generateStorageStateForAuth';

let viewerPage;

test.use({ usersNumber: 2 });

test.beforeEach(
  async ({
    browser,
    pages,
    users,
    articleWithoutTags,
    usersApi,
    articlesApi,
  }) => {
    const authorResponse = await usersApi.registerNewUser(users[0]);
    await usersApi.assertSuccessResponseCode(authorResponse);
    users[0].token = await usersApi.parseTokenFromBody(authorResponse);

    const viewerResponse = await usersApi.registerNewUser(users[1]);
    await usersApi.assertSuccessResponseCode(viewerResponse);
    users[1].token = await usersApi.parseTokenFromBody(viewerResponse);

    const storageState = generateStorageStateForAuth(users[1]);
    const context = await browser.newContext(storageState);
    viewerPage = await context.newPage();

    const createResponse = await articlesApi.createArticle(
      {
        title: articleWithoutTags.title,
        description: articleWithoutTags.description,
        body: articleWithoutTags.text,
        tagList: articleWithoutTags.tags,
      },
      users[0].token,
    );

    await articlesApi.assertResponseBodyContainsSlug(createResponse);
    const slug = await articlesApi.parseSlugFromResponse(createResponse);

    articleWithoutTags.url = `${process.env.BASE_URL}/article/${slug}`;
  },
);

test('View an article created by another registered user', async ({
  articleWithoutTags,
  users,
}) => {
  const page = new InternalViewArticlePage(viewerPage, 1);

  await page.open(articleWithoutTags.url);
  await page.articleHeader.assertTitleIsVisible(articleWithoutTags.title);
  await page.articleContent.assertArticleTextIsVisible(articleWithoutTags.text);
  await page.articleHeader.assertAuthorNameIsVisible(users[0].username);
});
