export default {
  async redirects() {
    // The Export page was removed; send old links to the quote page.
    return [{ source: "/export", destination: "/contact", permanent: true }];
  },
};
