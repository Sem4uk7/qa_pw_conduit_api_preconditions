import { test } from '../../_fixtures/fixtures';
import { ExternalViewArticlePage } from '../../../src/ui/pages/article/view/ExternalViewArticlePage';

test.use({ contextsNumber: 1, usersNumber: 1 });

test.beforeEach(
  async ({ registeredUsers, articlesApi, articleWithoutTags }) => {
    const response = await articlesApi.createArticle(
      {
        title: articleWithoutTags.title,
        description: articleWithoutTags.description,
        body: articleWithoutTags.text,
        tagList: articleWithoutTags.tags,
      },
      registeredUsers[0].token,
    );

    await articlesApi.assertResponseBodyContainsSlug(response);
    const slug = await articlesApi.parseSlugFromResponse(response);

    articleWithoutTags.url = `${process.env.BASE_URL}/article/${slug}`;
  },
);

test('View an article as not registered user', async ({
  articleWithoutTags,
  pages,
  registeredUsers,
}) => {
  const page = new ExternalViewArticlePage(pages[0], 1);

  await page.open(articleWithoutTags.url);
  await page.articleHeader.assertTitleIsVisible(articleWithoutTags.title);
  await page.articleContent.assertArticleTextIsVisible(articleWithoutTags.text);
  await page.articleHeader.assertAuthorNameIsVisible(
    registeredUsers[0].username,
  );
});
