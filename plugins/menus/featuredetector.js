// ft.js
(function(window) {
  // 简介
  window._ftMeta = {
    name: 'featuredetector',
    author: 'netport',
    version: 'rc-1.0.0',
    ghlink: 'https://github.com/netp0rt（暂未上传）',
    des: '浏览器ES5+/CSS兼容性检测插件',
    loadedAt: new Date().toISOString()
  };
  // ECMAScript版本映射表
  var esVersionMap = {
    'ES5': 5,
    'ES6': 6,
    'ES2016': 7,
    'ES2017': 8,
    'ES2018': 9,
    'ES2019': 10,
    'ES2020': 11,
    'ES2021': 12,
    'ES2022': 13,
    'ES2023': 14,
    'ES2024': 15,
    'ES2025': 16
  };

  // ECMAScript特性列表
  var esFeatures = [
    // ES5
    { name: '严格模式', test: function() { return eval('"use strict"; true'); }, version: 'ES5' },
    { name: 'var 声明', test: function() { return eval('var x = 1; true'); }, version: 'ES5' },
    
    // ES6 (ES2015)
    { name: 'let/const', test: function() { 
      try { return eval('let x = 1; const y = 2; true'); } 
      catch(e) { return false; } 
    }, version: 'ES6' },
    
    { name: '箭头函数', test: function() { 
      try { return eval('(() => 42)() === 42'); } 
      catch(e) { return false; } 
    }, version: 'ES6' },
    
    // ES2016
    { name: 'Array.includes', test: function() { 
      return typeof [].includes === 'function'; 
    }, version: 'ES2016' },
    
    // ES2017
    { name: 'async/await', test: function() { 
      try { return eval('(async function() {})()') instanceof Promise; } 
      catch(e) { return false; } 
    }, version: 'ES2017' },
    
    // ES2018
    { name: '展开运算符', test: function() { 
      try { return eval('[...[1,2]].length === 2'); } 
      catch(e) { return false; } 
    }, version: 'ES2018' },
    
    // ES2019
    { name: 'Array.flat', test: function() { 
      return typeof [].flat === 'function'; 
    }, version: 'ES2019' },
    
    // ES2020
    { name: '可选链 (?.)', test: function() { 
      try { return eval('({})?.a === undefined'); } 
      catch(e) { return false; } 
    }, version: 'ES2020' },
    
    { name: '空值合并 (??)', test: function() { 
      try { return eval('null ?? "default" === "default"'); } 
      catch(e) { return false; } 
    }, version: 'ES2020' },
    
    // ES2021
    { name: 'String.replaceAll', test: function() { 
      return typeof ''.replaceAll === 'function'; 
    }, version: 'ES2021' },
    
    { name: '数字分隔符 (_)', test: function() { 
      try { return eval('1_000 === 1000'); } 
      catch(e) { return false; } 
    }, version: 'ES2021' },
    
    // ES2022
    { name: '私有类字段', test: function() { 
      try { return eval('(class C { #x=1; getX() { return this.#x } })'); } 
      catch(e) { return false; } 
    }, version: 'ES2022' },
    
    { name: 'Array.at', test: function() { 
      return typeof [].at === 'function'; 
    }, version: 'ES2022' },
    
    // ES2023
    { name: 'Array.findLast', test: function() { 
      return typeof [].findLast === 'function'; 
    }, version: 'ES2023' },
    
    // ES2024
    { name: 'Object.groupBy', test: function() { 
      return typeof Object.groupBy === 'function'; 
    }, version: 'ES2024' },
    
    // ES2025
    { name: 'Promise.withResolvers', test: function() { 
      return typeof Promise.withResolvers === 'function'; 
    }, version: 'ES2025' }
  ];

  // CSS特性列表
  var cssFeatures = [
    /* ======== CSS1 (1996) ======== */
    { 
      name: '字体样式控制', 
      test: function() {
        var el = document.createElement('div');
        el.style.fontFamily = 'Arial';
        el.style.fontSize = '16px';
        return el.style.fontFamily.includes('Arial') && 
               el.style.fontSize === '16px';
      }, 
      version: 'CSS1',
      description: '基础字体和文本样式控制'
    },
    
    /* ======== CSS2 (1998) ======== */
    { 
      name: '绝对定位', 
      test: function() {
        var el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.top = '10px';
        return el.style.position === 'absolute' &&
               el.style.top === '10px';
      }, 
      version: 'CSS2',
      description: 'position定位系统'
    },
    { 
      name: '鼠标悬停效果', 
      test: function() {
        return CSSStyleSheet.prototype.insertRule ? 
          true : 
          document.styleSheets[0].addRule;
      }, 
      version: 'CSS2',
      description: ':hover伪类支持'
    },
    
    /* ======== CSS2.1 (2004) ======== */
    { 
      name: '最大宽度', 
      test: function() {
        var el = document.createElement('div');
        el.style.maxWidth = '100px';
        return el.style.maxWidth === '100px';
      }, 
      version: 'CSS2',
      description: 'min/max-width/height支持'
    },
    
    /* ======== CSS3 (模块化) ======== */
    { 
      name: '圆角边框', 
      test: function() {
        var el = document.createElement('div');
        el.style.borderRadius = '5px';
        return el.style.borderRadius === '5px';
      }, 
      version: 'CSS3',
      description: 'border-radius属性'
    },
    { 
      name: '盒阴影', 
      test: function() {
        var el = document.createElement('div');
        el.style.boxShadow = '2px 2px 2px rgba(0,0,0,0.2)';
        return el.style.boxShadow.includes('2px') || 
               el.style.boxShadow !== '';
      }, 
      version: 'CSS3',
      description: 'box-shadow属性'
    },
    { 
      name: 'Flex布局', 
      test: function() {
        var el = document.createElement('div');
        el.style.display = 'flex';
        return el.style.display === 'flex';
      }, 
      version: 'CSS3',
      description: '弹性盒子布局'
    },
    { 
      name: '过渡动画', 
      test: function() {
        var el = document.createElement('div');
        el.style.transition = 'all 0.3s ease';
        return el.style.transition.includes('0.3s');
      }, 
      version: 'CSS3',
      description: 'transition过渡效果'
    },
    { 
      name: '媒体查询', 
      test: function() {
        return typeof matchMedia !== 'undefined' && 
               matchMedia('(max-width: 600px)').matches !== undefined;
      }, 
      version: 'CSS3',
      description: '@media响应式设计'
    },
    
    /* ======== CSS4 (草案特性) ======== */
    { 
      name: 'CSS变量', 
      test: function() {
        try {
          var el = document.createElement('div');
          el.style.setProperty('--primary-color', 'red');
          return el.style.getPropertyValue('--primary-color') === 'red';
        } catch {
          return false;
        }
      }, 
      version: 'CSS4',
      description: '自定义属性(--var)'
    },
    { 
      name: '@supports规则', 
      test: function() {
        return typeof CSS !== 'undefined' && 
               typeof CSS.supports === 'function' &&
               CSS.supports('display', 'grid');
      }, 
      version: 'CSS4',
      description: '特性检测规则'
    },
    { 
      name: '网格布局', 
      test: function() {
        var el = document.createElement('div');
        el.style.display = 'grid';
        return el.style.display === 'grid';
      }, 
      version: 'CSS4',
      description: 'CSS Grid布局'
    }
  ];

  // 检测单个特性
  function testFeature(feature) {
    try {
      return feature.test();
    } catch (e) {
      return false;
    }
  }

  // 获取版本号数字
  function getVersionNum(version) {
    if (version.startsWith('ES')) {
      return esVersionMap[version] || 0;
    } else if (version.startsWith('CSS')) {
      return parseInt(version.replace('CSS', ''));
    }
    return 0;
  }

  // 主检测函数
  function featureTest(options) {
    options = options || {};
    var mode = options.mode || 'j'; // 默认检测JavaScript
    var strict = options.strict || false;
    var impact = options.impact || false;
    var minver = options.minver || 0;
    
    var featuresToTest = [];
    
    // 根据模式选择要检测的特性
    if (mode === 'j' || mode === 'a') {
      featuresToTest = featuresToTest.concat(esFeatures);
    }
    if (mode === 'c' || mode === 'a') {
      featuresToTest = featuresToTest.concat(cssFeatures);
    }
    
    // 初始化结果对象
    var result = {
      maxVer: 'ES5', // 默认最低版本
      impact: impact ? [] : undefined,
      isPass: minver ? false : undefined
    };
    
    // 初始化版本支持统计
    var versionStats = {};
    featuresToTest.forEach(function(feature) {
      var version = feature.version;
      if (!versionStats[version]) {
        versionStats[version] = {
          total: 0,
          support: 0
        };
      }
    });
    
    // 测试所有特性并统计
    featuresToTest.forEach(function(feature) {
      var isSupported = testFeature(feature);
      var version = feature.version;
      
      versionStats[version].total++;
      if (isSupported) {
        versionStats[version].support++;
      }
    });
    
    // 按版本号排序
    var sortedVersions = Object.keys(versionStats).sort(function(a, b) {
      return getVersionNum(b) - getVersionNum(a);
    });
    
    // 计算最大支持版本
    if (strict) {
      // 严格模式：取完全支持的最高版本
      for (var i = 0; i < sortedVersions.length; i++) {
        var ver = sortedVersions[i];
        if (versionStats[ver].support === versionStats[ver].total) {
          result.maxVer = ver;
          break;
        }
      }
    } else {
      // 宽松模式：取有支持的最高版本
      for (var j = 0; j < sortedVersions.length; j++) {
        var ver = sortedVersions[j];
        if (versionStats[ver].support > 0) {
          result.maxVer = ver;
          break;
        }
      }
    }
    
    // 如果需要impact数据
    if (impact) {
      // 按版本号从低到高排序
      var impactVersions = Object.keys(versionStats).sort(function(a, b) {
        return getVersionNum(a) - getVersionNum(b);
      });
      
      impactVersions.forEach(function(version) {
        result.impact.push({
          version: version,
          total: versionStats[version].total,
          support: versionStats[version].support
        });
      });
    }
    
    // 如果需要检查最低版本要求
    if (minver) {
      var currentVerNum = getVersionNum(result.maxVer);
      result.isPass = currentVerNum >= minver;
    }
    
    return result;
  }

  // 挂载到window对象
  window.ft = {
    test: featureTest,
    versions: esVersionMap
  };
})(window);