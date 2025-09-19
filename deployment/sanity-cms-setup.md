# Sanity.io CMS Setup for JokerVision Marketing Site

## 1. Create Sanity Account

1. Go to [Sanity.io](https://www.sanity.io/)
2. Sign up with GitHub or Google
3. Choose **Start for free**

## 2. Create New Project

```bash
# Install Sanity CLI
npm install -g @sanity/cli

# Create new project
sanity init

# Follow prompts:
# - Project name: JokerVision Marketing
# - Use default dataset configuration: Y
# - Project output path: ./jokervision-cms
# - Select project template: Blog (schema)
```

## 3. Configure Schemas for JokerVision

Navigate to your CMS directory and create these schemas:

### Landing Page Schema
```javascript
// schemas/landingPage.js
export default {
  name: 'landingPage',
  title: 'Landing Page',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Page Title',
      type: 'string'
    },
    {
      name: 'heroSection',
      title: 'Hero Section',
      type: 'object',
      fields: [
        {name: 'headline', type: 'string'},
        {name: 'subheadline', type: 'text'},
        {name: 'ctaText', type: 'string'},
        {name: 'ctaLink', type: 'string'},
        {name: 'heroImage', type: 'image'}
      ]
    },
    {
      name: 'features',
      title: 'Features Section',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {name: 'title', type: 'string'},
          {name: 'description', type: 'text'},
          {name: 'icon', type: 'image'}
        ]
      }]
    },
    {
      name: 'pricing',
      title: 'Pricing Section',
      type: 'object',
      fields: [
        {name: 'title', type: 'string'},
        {name: 'description', type: 'text'},
        {name: 'plans', type: 'array', of: [{
          type: 'object',
          fields: [
            {name: 'name', type: 'string'},
            {name: 'price', type: 'number'},
            {name: 'features', type: 'array', of: [{type: 'string'}]},
            {name: 'highlighted', type: 'boolean'}
          ]
        }]}
      ]
    }
  ]
}
```

### Blog Post Schema
```javascript
// schemas/blogPost.js
export default {
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    {name: 'title', title: 'Title', type: 'string'},
    {name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title'}},
    {name: 'author', title: 'Author', type: 'string'},
    {name: 'publishedAt', title: 'Published At', type: 'datetime'},
    {name: 'excerpt', title: 'Excerpt', type: 'text'},
    {name: 'featuredImage', title: 'Featured Image', type: 'image'},
    {name: 'content', title: 'Content', type: 'array', of: [{type: 'block'}]},
    {name: 'tags', title: 'Tags', type: 'array', of: [{type: 'string'}]},
    {name: 'seo', title: 'SEO', type: 'object', fields: [
      {name: 'metaTitle', type: 'string'},
      {name: 'metaDescription', type: 'text'}
    ]}
  ]
}
```

## 4. Deploy Sanity Studio

```bash
cd jokervision-cms
sanity deploy

# Choose a studio hostname: jokervision-cms
# Your studio will be available at: https://jokervision-cms.sanity.studio
```

## 5. Get API Credentials

1. Go to [Sanity Management](https://manage.sanity.io/)
2. Select your project
3. Go to **API** tab
4. Add CORS origin: `https://jokervision.com`
5. Copy your **Project ID** and **Dataset name**

## 6. Create Read Token

1. In **API** tab, click **Add API token**
2. Label: `Production Read Token`
3. Permissions: **Viewer**
4. Copy the token (save securely)

## 7. Integration with React

Install Sanity client in your React app:

```bash
cd frontend
yarn add @sanity/client @sanity/image-url
```

Create Sanity client:
```javascript
// frontend/src/lib/sanity.js
import sanityClient from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = sanityClient({
  projectId: 'your-project-id',
  dataset: 'production',
  token: 'your-read-token',
  useCdn: true
})

const builder = imageUrlBuilder(client)
export const urlFor = (source) => builder.image(source)
```

## 8. Fetch Content in React

```javascript
// Example: Fetch landing page content
import { client } from '../lib/sanity'

const [landingPage, setLandingPage] = useState(null)

useEffect(() => {
  client.fetch('*[_type == "landingPage"][0]')
    .then(setLandingPage)
    .catch(console.error)
}, [])
```

## 9. Monthly Cost

- **Sanity.io**: $99/month for Growth plan
- Includes: Unlimited API requests, 3 users, 10GB assets
- Perfect for marketing site and blog content