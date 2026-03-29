const config = {
  site: {
    name: 'Hardik Ojha',
    // URL of the deployed site — used for SEO and sitemaps
    url: 'https://kidrahahjo.github.io',
    // Subpath if deploying to github.io/repo-name. Set to '' for a custom domain.
    base: '/who-am-i',
    description:
      "I write about the decisions, tradeoffs, and systems thinking that don't show up in a résumé or a GitHub profile — the reasoning behind the code.",
  },

  nav: {
    links: [
      { label: 'writing', href: '/' },
      { label: 'about', href: '/about' },
    ],
  },

  social: {
    email: 'hardikojha@outlook.com',
    github: 'https://github.com/kidrahahjo',
    linkedin: 'https://linkedin.com/in/kidrahahjo',
    x: 'https://x.com/kidrahahjo',
  },
};

export default config;
