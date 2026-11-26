# 第三方声明 / Third-party notices

**gifenc 1.0.3** is the one bundled runtime package. The standalone userscript includes the published unminified `dist/gifenc.js` inside a private wrapper. It uses the original GIFEncoder, quantize, and applyPalette APIs, with no external code request. The package declares MIT. [npm release](https://www.npmjs.com/package/gifenc/v/1.0.3) · [Project source](https://github.com/mattdesl/gifenc) · [gifenc MIT notice](licenses/gifenc-MIT.txt)

The npm archive's SHA-512 is recorded here for provenance:

```
c5dafa01dadf18171fce770e3543a55cc06e739c090ed3ae784ddce6b746d28360b4834b0fe7f6885665b6b051658cc00916caafe992554ff1f7ccefdaede39b
```

## Upstream source notices

- The gifenc source credits **PnnQuant.js** and names Mark Tyler, Dmitry Groshev, and Miller Cy Chan in its adapted quantizer. The package does not name the original PnnQuant.js commit. This distribution retains the source's copyright lines and provides the adapted file under the upstream project's MPL-2.0 terms. [PnnQuant.js](https://github.com/mcychan/PnnQuant.js) · [MPL 2.0](licenses/MPL-2.0.txt) · [Corresponding quantizer source](vendor/gifenc-1.0.3/src/pnnquant2.js)
- gifenc also credits **gif.js** and **gif-codec**. Their notices are reproduced here and in the standalone script. They are upstream credits, not separately loaded packages. [gif.js MIT notice](licenses/gif.js-MIT.txt) · [gif-codec MIT notice](licenses/gif-codec-MIT.txt)

The preferred source form for the bundled encoder is available in [vendor/gifenc-1.0.3/src](vendor/gifenc-1.0.3/src) and in the [pinned npm archive](https://registry.npmjs.org/gifenc/-/gifenc-1.0.3.tgz). The historical LZW credits retain the authors' names.

本脚本内嵌 gifenc 1.0.3 的未压缩发行构建。原包及上游署名、MIT 声明、PnnQuant 衍生代码的 MPL-2.0 文本与对应源码均随包提供。项目自身许可见 [许可证建议](LICENSE-PROPOSAL.md)。
