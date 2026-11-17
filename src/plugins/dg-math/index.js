// 数学公式：解析仍在 markdown-it 阶段完成（保证 $...$ 不被当作 markdown 强调语法打散），
// 但渲染交给浏览器端的 MathJax 完成。
//
// 为什么不在服务端渲染：MathJax 的 SVG 输出会把每个公式的字形路径内联进页面，
// 公式密集的真题集单页可达 10MB+、整站 300MB+，构建还要吃掉 3~5GB 内存、十几分钟。
// 浏览器端渲染后，页面里只留 TeX 源码，单页几十 KB，构建几秒钟。
module.exports = {
  setupMarkdown(md) {
    // 只用它注册 math_inline / math_block 两条 token 规则（渲染结果会被下面覆盖）
    md.use(require("markdown-it-mathjax3"), {
      tex: {
        inlineMath: [["$", "$"]],
      },
      options: {
        skipHtmlTags: { "[-]": ["pre", "code"] },
      },
    });

    const escapeHtml = (s) =>
      String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    md.renderer.rules.math_inline = function (tokens, idx) {
      const tex = tokens[idx].content;
      return (
        '<span class="math math-inline">\\(' + escapeHtml(tex) + "\\)</span>"
      );
    };

    md.renderer.rules.math_block = function (tokens, idx) {
      const tex = tokens[idx].content;
      return (
        '<div class="math math-display">\\[' + escapeHtml(tex) + "\\]</div>"
      );
    };
  },

  // 把 MathJax 的自托管脚本拷进站点（不走 CDN，校园网/手机都能加载）
  setupEleventy(eleventyConfig) {
    try {
      eleventyConfig.addPassthroughCopy({
        "node_modules/mathjax-full/es5/tex-svg-full.js": "js/tex-svg-full.js",
      });
    } catch (e) {
      console.warn("[dg-math] 拷贝 MathJax 脚本失败:", e.message);
    }
  },
};
