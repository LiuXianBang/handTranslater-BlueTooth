"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "UniCollapse",
  props: {
    accordion: {
      // 是否开启手风琴效果
      type: [Boolean, String],
      default: false
    }
  },
  data() {
    return {};
  },
  provide() {
    return {
      collapse: this
    };
  },
  created() {
    this.childrens = [];
  },
  methods: {
    onChange() {
      let activeItem = [];
      this.childrens.forEach((vm, index) => {
        if (vm.isOpen) {
          activeItem.push(vm.nameSync);
        }
      });
      this.$emit("change", activeItem);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {};
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d6db774a"], ["__file", "C:/Users/38200/Desktop/handTranslater/uni_modules/uni-ui/components/uni-collapse/uni-collapse.vue"]]);
wx.createComponent(Component);
