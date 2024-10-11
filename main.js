/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => HtmlLocalImgPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var import_view = require("@codemirror/view");
var DEFAULT_SETTINGS = {
  mySetting: "default"
};
var VerticalLinesPluginValue = class {
  constructor(path, view, callback) {
    this.path = path;
    this.view = view;
    this.callback = callback;
  }
  update(update) {
    this.callback(this.view.dom, this.path);
  }
};
var HtmlLocalImgPlugin = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    console.log("Running on ---------------onload");
    this.registerMarkdownPostProcessor((element, ctx) => {
      this.processElement(element, ctx.sourcePath);
    });
    let activeFile = this.app.workspace.getActiveFile();
    if (activeFile) {
      this.registerEditorExtension(
        import_view.ViewPlugin.define(
          (view) => new VerticalLinesPluginValue(
            activeFile == null ? void 0 : activeFile.path,
            view,
            this.processElement.bind(this)
          )
        )
      );
    }
  }
  processElement(element, sourcePath) {
    var _a;
    let targetLinks = Array.from(element.getElementsByTagName("img"));
    if (((_a = this.app) == null ? void 0 : _a.metadataCache) == null) {
      return;
    }
    for (const link of targetLinks) {
      if (link.src == "" || link.src.includes("https://")) {
        continue;
      }
      let clean_link = link.src.replace("app://obsidian.md/", "");
      let imageFile = this.app.metadataCache.getFirstLinkpathDest(clean_link, sourcePath);
      if (imageFile == null) {
        continue;
      }
      let active_path = this.app.vault.getResourcePath(imageFile);
      clean_link = clean_link.replace("capacitor://localhost/", "");
      let full_link = active_path + "/" + clean_link;
      link.src = full_link;
      if (import_obsidian.Platform.isMobile) {
        console.log("Running on mobile platform - setting object fit and height of img");
        link.style.objectFit = "contain";
        link.height = 100;
      }
    }
  }
  onunload() {
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgQXBwLCBFZGl0b3IsIEV2ZW50UmVmLCBNYXJrZG93blBvc3RQcm9jZXNzb3JDb250ZXh0LCBNYXJrZG93blZpZXcsIE1vZGFsLCBOb3RpY2UsIFBsYXRmb3JtLCBQbHVnaW4sIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcsIFRGaWxlIH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5pbXBvcnQge1xyXG5cdEVkaXRvclZpZXcsXHJcblx0UGx1Z2luVmFsdWUsXHJcblx0Vmlld1BsdWdpbixcclxuXHRWaWV3VXBkYXRlLFxyXG5cdERlY29yYXRpb25TZXQsXHJcblx0RGVjb3JhdGlvbixcclxufSBmcm9tIFwiQGNvZGVtaXJyb3Ivdmlld1wiO1xyXG5cclxuaW50ZXJmYWNlIFBsdWdpblNldHRpbmdzIHtcclxuXHRteVNldHRpbmc6IHN0cmluZztcclxufVxyXG5cclxuY29uc3QgREVGQVVMVF9TRVRUSU5HUzogUGx1Z2luU2V0dGluZ3MgPSB7XHJcblx0bXlTZXR0aW5nOiAnZGVmYXVsdCdcclxufVxyXG5cclxuXHJcbmNsYXNzIFZlcnRpY2FsTGluZXNQbHVnaW5WYWx1ZSBpbXBsZW1lbnRzIFBsdWdpblZhbHVlIHtcclxuXHRjb25zdHJ1Y3RvcihcclxuXHRcdHByaXZhdGUgcGF0aDogc3RyaW5nLFxyXG5cdFx0cHJpdmF0ZSB2aWV3OiBFZGl0b3JWaWV3LFxyXG5cdFx0cHJpdmF0ZSBjYWxsYmFjazogRnVuY3Rpb24sXHJcblxyXG5cdCkge1xyXG5cdFx0Ly8gY29uc29sZS5sb2codGhpcy52aWV3KTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZSh1cGRhdGU6IFZpZXdVcGRhdGUpIHtcclxuXHRcdC8vIGNvbnNvbGUubG9nKFwidXBkYXRlXCIsIHVwZGF0ZSk7XHJcblx0XHR0aGlzLmNhbGxiYWNrKHRoaXMudmlldy5kb20sIHRoaXMucGF0aCk7XHJcblxyXG5cdFx0Ly8gaWYgKFxyXG5cdFx0Ly8gXHR1cGRhdGUuZG9jQ2hhbmdlZCB8fFxyXG5cdFx0Ly8gXHR1cGRhdGUudmlld3BvcnRDaGFuZ2VkIHx8XHJcblx0XHQvLyBcdHVwZGF0ZS5nZW9tZXRyeUNoYW5nZWQgfHxcclxuXHRcdC8vIFx0dXBkYXRlLnRyYW5zYWN0aW9ucy5zb21lKCh0cikgPT4gdHIucmVjb25maWd1cmVkKVxyXG5cdFx0Ly8gKSB7XHJcblx0XHQvLyBcdHRoaXMuc2NoZWR1bGVSZWNhbGN1bGF0ZSgpO1xyXG5cdFx0Ly8gfVxyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSHRtbExvY2FsSW1nUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcclxuXHRzZXR0aW5nczogUGx1Z2luU2V0dGluZ3M7XHJcblxyXG5cdGFzeW5jIG9ubG9hZCgpIHtcclxuXHRcdGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XHJcblx0XHRjb25zb2xlLmxvZyhcIlJ1bm5pbmcgb24gLS0tLS0tLS0tLS0tLS0tb25sb2FkXCIpXHJcblxyXG5cclxuXHRcdHRoaXMucmVnaXN0ZXJNYXJrZG93blBvc3RQcm9jZXNzb3IoKGVsZW1lbnQsIGN0eCkgPT4ge1xyXG5cdFx0XHR0aGlzLnByb2Nlc3NFbGVtZW50KGVsZW1lbnQsIGN0eC5zb3VyY2VQYXRoKTtcclxuXHRcdH0pXHJcblxyXG5cclxuXHJcblx0XHRsZXQgYWN0aXZlRmlsZSA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XHJcblx0XHRpZiAoYWN0aXZlRmlsZSkge1xyXG5cdFx0XHR0aGlzLnJlZ2lzdGVyRWRpdG9yRXh0ZW5zaW9uKFxyXG5cdFx0XHRcdFZpZXdQbHVnaW4uZGVmaW5lKFxyXG5cdFx0XHRcdFx0KHZpZXcpID0+XHJcblx0XHRcdFx0XHRcdG5ldyBWZXJ0aWNhbExpbmVzUGx1Z2luVmFsdWUoXHJcblx0XHRcdFx0XHRcdFx0YWN0aXZlRmlsZT8ucGF0aCxcclxuXHRcdFx0XHRcdFx0XHR2aWV3LFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMucHJvY2Vzc0VsZW1lbnQuYmluZCh0aGlzKVxyXG5cdFx0XHRcdFx0XHQpKSxcclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByb2Nlc3NFbGVtZW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBzb3VyY2VQYXRoOiBzdHJpbmcpIHtcclxuXHRcdGxldCB0YXJnZXRMaW5rcyA9IEFycmF5LmZyb20oZWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImltZ1wiKSk7XHJcblx0XHQvLyBjb25zb2xlLmxvZygndGFyZ2V0TGlua3M6ICcsIHRhcmdldExpbmtzKVxyXG5cclxuXHRcdGlmICh0aGlzLmFwcD8ubWV0YWRhdGFDYWNoZSA9PSBudWxsKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdGZvciAoY29uc3QgbGluayBvZiB0YXJnZXRMaW5rcykge1xyXG5cdFx0XHQvLyBjb25zb2xlLmxvZygnbGluay5zcmM6ICcsIGxpbmsuc3JjKTtcclxuXHRcdFx0aWYgKGxpbmsuc3JjID09IFwiXCIgfHwgbGluay5zcmMuaW5jbHVkZXMoXCJodHRwczovL1wiKSkge1xyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdGxldCBjbGVhbl9saW5rID0gbGluay5zcmMucmVwbGFjZSgnYXBwOi8vb2JzaWRpYW4ubWQvJywgJycpXHJcblx0XHRcdC8vIGNvbnNvbGUubG9nKCdjbGVhbl9saW5rOiAnICsgY2xlYW5fbGluaylcclxuXHJcblx0XHRcdGxldCBpbWFnZUZpbGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpcnN0TGlua3BhdGhEZXN0KGNsZWFuX2xpbmssIHNvdXJjZVBhdGgpO1xyXG5cdFx0XHRpZiAoaW1hZ2VGaWxlID09IG51bGwpIHtcclxuXHRcdFx0XHQvLyBjb25zb2xlLmxvZygnbnVsbCBjbGVhbl9saW5rOiAnICsgY2xlYW5fbGluaylcclxuXHRcdFx0XHQvLyBjb25zb2xlLmxvZygnaW1hZ2VGaWxlIGlzIG51bGwnKVxyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8vIGxldCBhY3RpdmVfcGF0aDAgPSB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmdldFJlc291cmNlUGF0aChpbWFnZUZpbGUucGF0aCk7XHJcblx0XHRcdGxldCBhY3RpdmVfcGF0aCA9IHRoaXMuYXBwLnZhdWx0LmdldFJlc291cmNlUGF0aChpbWFnZUZpbGUpXHJcblx0XHRcdC8vIGNvbnNvbGUubG9nKCdhY3RpdmVfcGF0aDA6ICcgKyBhY3RpdmVfcGF0aDApXHJcblx0XHRcdC8vIEZvciBpT1NcclxuXHRcdFx0Y2xlYW5fbGluayA9IGNsZWFuX2xpbmsucmVwbGFjZSgnY2FwYWNpdG9yOi8vbG9jYWxob3N0LycsICcnKVxyXG5cdFx0XHQvLyBjb25zb2xlLmxvZygnY2xlYW5fbGluazogJyArIGNsZWFuX2xpbmspXHJcblx0XHRcdGxldCBmdWxsX2xpbmsgPSBhY3RpdmVfcGF0aCArICcvJyArIGNsZWFuX2xpbmtcclxuXHRcdFx0Ly8gY29uc29sZS5sb2coJ2Z1bGxfbGluazogJyArIGZ1bGxfbGluaylcclxuXHRcdFx0bGluay5zcmMgPSBmdWxsX2xpbmtcclxuXHRcdFx0aWYgKFBsYXRmb3JtLmlzTW9iaWxlKSB7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coXCJSdW5uaW5nIG9uIG1vYmlsZSBwbGF0Zm9ybSAtIHNldHRpbmcgb2JqZWN0IGZpdCBhbmQgaGVpZ2h0IG9mIGltZ1wiKVxyXG5cdFx0XHRcdGxpbmsuc3R5bGUub2JqZWN0Rml0ID0gXCJjb250YWluXCJcclxuXHRcdFx0XHRsaW5rLmhlaWdodCA9IDEwMFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdG9udW5sb2FkKCkge1xyXG5cclxuXHR9XHJcblxyXG5cdGFzeW5jIGxvYWRTZXR0aW5ncygpIHtcclxuXHRcdHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgc2F2ZVNldHRpbmdzKCkge1xyXG5cdFx0YXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcclxuXHR9XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQUFxSjtBQUNySixrQkFPTztBQU1QLElBQU0sbUJBQW1DO0FBQUEsRUFDeEMsV0FBVztBQUNaO0FBR0EsSUFBTSwyQkFBTixNQUFzRDtBQUFBLEVBQ3JELFlBQ1MsTUFDQSxNQUNBLFVBRVA7QUFKTztBQUNBO0FBQ0E7QUFBQSxFQUlUO0FBQUEsRUFFQSxPQUFPLFFBQW9CO0FBRTFCLFNBQUssU0FBUyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUk7QUFBQSxFQVV2QztBQUNEO0FBRUEsSUFBcUIscUJBQXJCLGNBQWdELHVCQUFPO0FBQUEsRUFHdEQsTUFBTSxTQUFTO0FBQ2QsVUFBTSxLQUFLLGFBQWE7QUFDeEIsWUFBUSxJQUFJLGtDQUFrQztBQUc5QyxTQUFLLDhCQUE4QixDQUFDLFNBQVMsUUFBUTtBQUNwRCxXQUFLLGVBQWUsU0FBUyxJQUFJLFVBQVU7QUFBQSxJQUM1QyxDQUFDO0FBSUQsUUFBSSxhQUFhLEtBQUssSUFBSSxVQUFVLGNBQWM7QUFDbEQsUUFBSSxZQUFZO0FBQ2YsV0FBSztBQUFBLFFBQ0osdUJBQVc7QUFBQSxVQUNWLENBQUMsU0FDQSxJQUFJO0FBQUEsWUFDSCx5Q0FBWTtBQUFBLFlBQ1o7QUFBQSxZQUNBLEtBQUssZUFBZSxLQUFLLElBQUk7QUFBQSxVQUM5QjtBQUFBLFFBQUM7QUFBQSxNQUNKO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFBQSxFQUVBLGVBQWUsU0FBc0IsWUFBb0I7QUF4RTFEO0FBeUVFLFFBQUksY0FBYyxNQUFNLEtBQUssUUFBUSxxQkFBcUIsS0FBSyxDQUFDO0FBR2hFLFVBQUksVUFBSyxRQUFMLG1CQUFVLGtCQUFpQixNQUFNO0FBQ3BDO0FBQUEsSUFDRDtBQUNBLGVBQVcsUUFBUSxhQUFhO0FBRS9CLFVBQUksS0FBSyxPQUFPLE1BQU0sS0FBSyxJQUFJLFNBQVMsVUFBVSxHQUFHO0FBQ3BEO0FBQUEsTUFDRDtBQUNBLFVBQUksYUFBYSxLQUFLLElBQUksUUFBUSxzQkFBc0IsRUFBRTtBQUcxRCxVQUFJLFlBQVksS0FBSyxJQUFJLGNBQWMscUJBQXFCLFlBQVksVUFBVTtBQUNsRixVQUFJLGFBQWEsTUFBTTtBQUd0QjtBQUFBLE1BQ0Q7QUFFQSxVQUFJLGNBQWMsS0FBSyxJQUFJLE1BQU0sZ0JBQWdCLFNBQVM7QUFHMUQsbUJBQWEsV0FBVyxRQUFRLDBCQUEwQixFQUFFO0FBRTVELFVBQUksWUFBWSxjQUFjLE1BQU07QUFFcEMsV0FBSyxNQUFNO0FBQ1gsVUFBSSx5QkFBUyxVQUFVO0FBQ3RCLGdCQUFRLElBQUksbUVBQW1FO0FBQy9FLGFBQUssTUFBTSxZQUFZO0FBQ3ZCLGFBQUssU0FBUztBQUFBLE1BQ2Y7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUFBLEVBQ0EsV0FBVztBQUFBLEVBRVg7QUFBQSxFQUVBLE1BQU0sZUFBZTtBQUNwQixTQUFLLFdBQVcsT0FBTyxPQUFPLENBQUMsR0FBRyxrQkFBa0IsTUFBTSxLQUFLLFNBQVMsQ0FBQztBQUFBLEVBQzFFO0FBQUEsRUFFQSxNQUFNLGVBQWU7QUFDcEIsVUFBTSxLQUFLLFNBQVMsS0FBSyxRQUFRO0FBQUEsRUFDbEM7QUFDRDsiLAogICJuYW1lcyI6IFtdCn0K
