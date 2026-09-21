import { test } from '../../_fixtures/fixtures';
import { InternalViewArticlePage } from '../../../src/ui/pages/article/view/InternalViewArticlePage';
import { signUpUser } from '../../../src/ui/actions/auth/signUpUser';

test.use({ contextsNumber: 1, usersNumber: 2 });

test.beforeEach(
  async ({ pages, users, articleWithoutTags, usersApi, articlesApi }) => {
    const registerResponse = await usersApi.registerNewUser(users[0]);
    await usersApi.assertSuccessResponseCode(registerResponse);
    users[0].token = await usersApi.parseTokenFromBody(registerResponse);

    await signUpUser(pages[0], users[1], 1);

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
  pages,
  users,
}) => {
  const page = new InternalViewArticlePage(pages[0], 1);

  await page.open(articleWithoutTags.url);
  await page.articleHeader.assertTitleIsVisible(articleWithoutTags.title);
  await page.articleContent.assertArticleTextIsVisible(articleWithoutTags.text);
  await page.articleHeader.assertAuthorNameIsVisible(users[0].username);
});
