/*
// 执行兼容性检测并输出详细日志
console.group('浏览器兼容性检测报告');
var compatResult = ft.test({ mode: 'j', impact: true, minver: 8 });

// 1. 输出基础信息
console.log('=== 浏览器基本信息 ===');
var browserInfo = ft.getBrowserInfo();
console.log('浏览器:', browserInfo.browser);
console.log('版本:', browserInfo.version);
console.log('平台:', browserInfo.platform);
console.log('UserAgent:', browserInfo.userAgent);

// 2. 输出版本支持情况
console.log('\n=== ECMAScript支持情况 ===');
console.log('最大支持版本:', compatResult.maxVer);
console.log('是否满足最低要求(ES2017+):', compatResult.isPass ? '✅ 满足' : '❌ 不满足');

// 3. 详细版本支持统计
console.log('\n=== 各版本特性支持率 ===');
compatResult.impact.forEach(item => {
    const supportRate = (item.support / item.total * 100).toFixed(1);
    console.log(
        `${item.version}: ${item.support}/${item.total} (${supportRate}%)`,
        item.support === item.total ? '✅ 完全支持' : 
        item.support === 0 ? '❌ 完全不支持' : '⚠️ 部分支持'
    );
});

// 4. 获取并输出不支持的特性
console.log('\n=== 不支持的重要特性 ===');
const unsupported = ft.getUnsupportedFeatures({ mode: 'j' })
    .filter(f => esVersionMap[f.version] >= 8); // 只显示ES2017+的不支持特性

if (unsupported.length > 0) {
    unsupported.forEach(f => {
        console.log(`❌ ${f.name} (${f.version}) - ${f.description}`);
    });
} else {
    console.log('✅ 所有ES2017+特性都支持');
}

// 5. 按版本分组输出不支持的特性
console.log('\n=== 按版本分组的不支持特性 ===');
const groupedUnsupported = unsupported.reduce((acc, feature) => {
    if (!acc[feature.version]) acc[feature.version] = [];
    acc[feature.version].push(feature);
    return acc;
}, {});

Object.entries(groupedUnsupported).forEach(([version, features]) => {
    console.log(`\n版本 ${version}:`);
    features.forEach(f => console.log(`  ❌ ${f.name} - ${f.description}`));
});

console.groupEnd();

// 6. 输出完整的特性支持表（可选）
console.groupCollapsed('查看完整特性支持表');
const allFeatures = ft.getAllFeatures({ mode: 'j' });
allFeatures.forEach(f => {
    console.log(
        `${f.supported ? '✅' : '❌'} ${f.name.padEnd(20)} ${f.version.padEnd(8)} ${f.description}`
    );
});
console.groupEnd();
*/

(function(window) {
  try {
      // 浏览器信息收集函数
      function getBrowserInfo() {
          const ua = navigator.userAgent;
          let browser = 'Unknown';
          let version = 'Unknown';

          // 检测浏览器类型及版本
          if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident/') > -1) {
              browser = 'Internet Explorer';
              version = ua.match(/MSIE (\d+\.\d+)/)?.[1] || ua.match(/rv:(\d+\.\d+)/)?.[1] || 'Unknown';
          } else if (ua.indexOf('Edge') > -1) {
              browser = 'Microsoft Edge';
              version = ua.match(/Edge\/(\d+\.\d+)/)?.[1] || 'Unknown';
          } else if (ua.indexOf('Chrome') > -1) {
              browser = 'Google Chrome';
              version = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'Unknown';
          } else if (ua.indexOf('Firefox') > -1) {
              browser = 'Mozilla Firefox';
              version = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown';
          } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
              browser = 'Safari';
              version = ua.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown';
          }

          return {
              browser,
              version,
              userAgent: ua,
              platform: navigator.platform,
              appVersion: navigator.appVersion
          };
      }

      // 简介
      window._ftMeta = {
          name: 'featuredetector',
          author: 'netport',
          version: 'rc-1.0.1',
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
          { name: '严格模式', test: function() { return eval('"use strict"; true'); }, version: 'ES5', description: '启用严格模式' },
          { name: 'var 声明', test: function() { return eval('var x = 1; true'); }, version: 'ES5', description: 'var变量声明' },
          { name: 'JSON 支持', test: function() { return typeof JSON !== 'undefined' && JSON.parse && JSON.stringify; }, version: 'ES5', description: 'JSON解析和序列化' },
          { name: '数组方法', test: function() { return typeof [].map === 'function' && typeof [].reduce === 'function'; }, version: 'ES5', description: '数组高阶函数(map/reduce等)' },
          { name: '函数bind', test: function() { return typeof Function.prototype.bind === 'function'; }, version: 'ES5', description: '函数绑定this' },
          
          // ES6 (ES2015)
          { name: 'let/const', test: function() { 
              try { return eval('let x = 1; const y = 2; true'); } 
              catch(e) { return false; } 
          }, version: 'ES6', description: '块级作用域变量声明' },
          { name: '箭头函数', test: function() { 
              try { return eval('(() => 42)() === 42'); } 
              catch(e) { return false; } 
          }, version: 'ES6', description: '箭头函数语法' },
          { name: '类语法', test: function() { 
              try { return eval('class C {}; true'); } 
              catch(e) { return false; } 
          }, version: 'ES6', description: 'class类语法' },
          { name: '模板字符串', test: function() { 
              try { return eval('`${42}` === "42"'); } 
              catch(e) { return false; } 
          }, version: 'ES6', description: '模板字符串和插值表达式' },
          { name: 'Promise', test: function() { 
              return typeof Promise !== 'undefined'; 
          }, version: 'ES6', description: 'Promise异步处理' },
          
          // ES2016
          { name: 'Array.includes', test: function() { 
              return typeof [].includes === 'function'; 
          }, version: 'ES2016', description: '数组包含检测' },
          { name: '指数运算符', test: function() { 
              try { return eval('2 ** 3 === 8'); } 
              catch(e) { return false; } 
          }, version: 'ES2016', description: '指数运算符(**)' },
          { name: 'Object.values', test: function() { 
              return typeof Object.values === 'function'; 
          }, version: 'ES2016', description: '获取对象值数组' },
          { name: 'Object.entries', test: function() { 
              return typeof Object.entries === 'function'; 
          }, version: 'ES2016', description: '获取对象键值对数组' },
          { name: '字符串填充', test: function() { 
              return typeof ''.padStart === 'function'; 
          }, version: 'ES2016', description: '字符串填充方法' },
          
          // ES2017
          { name: 'async/await', test: function() { 
              try { return eval('(async function() {})()') instanceof Promise; } 
              catch(e) { return false; } 
          }, version: 'ES2017', description: '异步函数语法' },
          { name: '共享内存', test: function() { 
              return typeof SharedArrayBuffer !== 'undefined'; 
          }, version: 'ES2017', description: '共享内存缓冲区' },
          { name: 'Object.getOwnPropertyDescriptors', test: function() { 
              return typeof Object.getOwnPropertyDescriptors === 'function'; 
          }, version: 'ES2017', description: '获取对象属性描述符' },
          { name: '字符串填充', test: function() { 
              return typeof ''.padEnd === 'function'; 
          }, version: 'ES2017', description: '字符串尾部填充' },
          { name: '函数参数尾逗号', test: function() { 
              try { return eval('function f(a,) {}; true'); } 
              catch(e) { return false; } 
          }, version: 'ES2017', description: '函数参数尾逗号' },
          
          // ES2018
          { name: '展开运算符', test: function() { 
              try { return eval('[...[1,2]].length === 2'); } 
              catch(e) { return false; } 
          }, version: 'ES2018', description: '数组/对象展开语法' },
          { name: 'Promise.finally', test: function() { 
              return typeof Promise.prototype.finally === 'function'; 
          }, version: 'ES2018', description: 'Promise最终回调' },
          { name: '异步迭代', test: function() { 
              try { return eval('async function* f() {}; true'); } 
              catch(e) { return false; } 
          }, version: 'ES2018', description: '异步生成器函数' },
          { name: '正则表达式命名捕获组', test: function() { 
              try { return eval('/(?<name>a)/.exec("a").groups.name === "a"'); } 
              catch(e) { return false; } 
          }, version: 'ES2018', description: '正则命名捕获组' },
          { name: '正则表达式dotAll标志', test: function() { 
              try { return eval('/./s.dotAll === true'); } 
              catch(e) { return false; } 
          }, version: 'ES2018', description: '正则s(dotAll)标志' },
          
          // ES2019
          { name: 'Array.flat', test: function() { 
              return typeof [].flat === 'function'; 
          }, version: 'ES2019', description: '数组扁平化' },
          { name: 'Object.fromEntries', test: function() { 
              return typeof Object.fromEntries === 'function'; 
          }, version: 'ES2019', description: '键值对数组转对象' },
          { name: '字符串trim方法', test: function() { 
              return typeof ''.trimStart === 'function' && typeof ''.trimEnd === 'function'; 
          }, version: 'ES2019', description: '字符串修剪方法' },
          { name: 'Symbol.description', test: function() { 
              return Symbol('test').description === 'test'; 
          }, version: 'ES2019', description: 'Symbol描述属性' },
          { name: '可选catch绑定', test: function() { 
              try { return eval('try { throw 0 } catch {}; true'); } 
              catch(e) { return false; } 
          }, version: 'ES2019', description: '可选的catch绑定' },
          
          // ES2020
          { name: '可选链 (?.)', test: function() { 
              try { return eval('({})?.a === undefined'); } 
              catch(e) { return false; } 
          }, version: 'ES2020', description: '可选链操作符' },
          { name: '空值合并 (??)', test: function() { 
              try { return eval('null ?? "default" === "default"'); } 
              catch(e) { return false; } 
          }, version: 'ES2020', description: '空值合并运算符' },
          { name: 'BigInt', test: function() { 
              return typeof BigInt !== 'undefined'; 
          }, version: 'ES2020', description: '大整数类型' },
          { name: 'Promise.allSettled', test: function() { 
              return typeof Promise.allSettled === 'function'; 
          }, version: 'ES2020', description: 'Promise.allSettled方法' },
          
          // ES2021
          { name: 'String.replaceAll', test: function() { 
              return typeof ''.replaceAll === 'function'; 
          }, version: 'ES2021', description: '字符串全局替换' },
          { name: '数字分隔符 (_)', test: function() { 
              try { return eval('1_000 === 1000'); } 
              catch(e) { return false; } 
          }, version: 'ES2021', description: '数字分隔符' },
          { name: 'Promise.any', test: function() { 
              return typeof Promise.any === 'function'; 
          }, version: 'ES2021', description: 'Promise.any方法' },
          { name: 'WeakRef', test: function() { 
              return typeof WeakRef !== 'undefined'; 
          }, version: 'ES2021', description: '弱引用' },
          { name: '逻辑赋值运算符', test: function() { 
              try { return eval('let x = 0; x ||= 1; x === 1'); } 
              catch(e) { return false; } 
          }, version: 'ES2021', description: '逻辑赋值运算符' },
          
          // ES2022
          { name: '私有类字段', test: function() { 
              try { return eval('(class C { #x=1; getX() { return this.#x } })'); } 
              catch(e) { return false; } 
          }, version: 'ES2022', description: '类私有字段' },
          { name: 'Array.at', test: function() { 
              return typeof [].at === 'function'; 
          }, version: 'ES2022', description: '数组at方法' },
          { name: 'Object.hasOwn', test: function() { 
              return typeof Object.hasOwn === 'function'; 
          }, version: 'ES2022', description: 'Object.hasOwn方法' },
          { name: '错误cause属性', test: function() { 
              try { return eval('new Error("", { cause: 42 }).cause === 42'); } 
              catch(e) { return false; } 
          }, version: 'ES2022', description: '错误对象的cause属性' },
          { name: '顶层await', test: function() { 
              try { return eval('await 42; true'); } 
              catch(e) { return false; } 
          }, version: 'ES2022', description: '模块顶层await' },
          
          // ES2023
          { name: 'Array.findLast', test: function() { 
              return typeof [].findLast === 'function'; 
          }, version: 'ES2023', description: '数组从后查找' },
          { name: 'Array.findLastIndex', test: function() { 
              return typeof [].findLastIndex === 'function'; 
          }, version: 'ES2023', description: '数组从后查找索引' },
          { name: 'Hashbang语法', test: function() { 
              try { return eval('#!/usr/bin/env node\n true'); } 
              catch(e) { return false; } 
          }, version: 'ES2023', description: 'Hashbang语法支持' },
          { name: 'Symbol作为WeakMap键', test: function() { 
              return typeof WeakMap !== 'undefined' && typeof Symbol !== 'undefined'; 
          }, version: 'ES2023', description: 'Symbol作为WeakMap键' },
          { name: '正则表达式v标志', test: function() { 
              try { return eval('/./v.test(".")'); } 
              catch(e) { return false; } 
          }, version: 'ES2023', description: '正则表达式v标志' },
          
          // ES2024
          { name: 'Object.groupBy', test: function() { 
              return typeof Object.groupBy === 'function'; 
          }, version: 'ES2024', description: '对象分组方法' },
          { name: 'Array.groupBy', test: function() { 
              return typeof Array.prototype.groupBy === 'function'; 
          }, version: 'ES2024', description: '数组分组方法' },
          { name: 'Record和Tuple', test: function() { 
              try { return eval('#{ x: 1 } !== #{ x: 1 }'); } 
              catch(e) { return false; } 
          }, version: 'ES2024', description: '记录和元组' },
          { name: '装饰器', test: function() { 
              try { return eval('@decorator class C {}; true'); } 
              catch(e) { return false; } 
          }, version: 'ES2024', description: '装饰器语法' },
          { name: '新的Set方法', test: function() { 
              return typeof Set.prototype.union === 'function'; 
          }, version: 'ES2024', description: 'Set集合操作方法' },
          
          // ES2025
          { name: 'Promise.withResolvers', test: function() { 
              return typeof Promise.withResolvers === 'function'; 
          }, version: 'ES2025', description: 'Promise.withResolvers方法' },
          { name: 'RegExp修饰符', test: function() { 
              try { return eval('/./l.test(".")'); } 
              catch(e) { return false; } 
          }, version: 'ES2025', description: '正则表达式l标志' },
          { name: '管道运算符', test: function() { 
              try { return eval('42 |> (x => x * 2) === 84'); } 
              catch(e) { return false; } 
          }, version: 'ES2025', description: '管道操作符' },
          { name: '新的Temporal API', test: function() { 
              return typeof Temporal !== 'undefined'; 
          }, version: 'ES2025', description: 'Temporal日期时间API' },
          { name: '新的ArrayBuffer方法', test: function() { 
              return typeof ArrayBuffer.prototype.resize === 'function'; 
          }, version: 'ES2025', description: 'ArrayBuffer调整大小' }
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
          var showUnsupported = options.showUnsupported || false;
          
          var featuresToTest = [];
          var unsupportedFeatures = [];
          
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
              isPass: minver ? false : undefined,
              unsupported: showUnsupported ? [] : undefined
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
              } else if (showUnsupported) {
                  result.unsupported.push({
                      name: feature.name,
                      version: feature.version,
                      description: feature.description || ''
                  });
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
          versions: esVersionMap,
          getBrowserInfo: getBrowserInfo,
          // 新增方法：获取所有不支持的特性
          getUnsupportedFeatures: function(options) {
              options = options || {};
              options.mode = options.mode || 'j';
              options.showUnsupported = true;
              
              var result = featureTest(options);
              return result.unsupported;
          },
          // 新增方法：获取所有特性检测结果
          getAllFeatures: function(options) {
              options = options || {};
              var mode = options.mode || 'j';
              
              var featuresToTest = [];
              if (mode === 'j' || mode === 'a') {
                  featuresToTest = featuresToTest.concat(esFeatures);
              }
              if (mode === 'c' || mode === 'a') {
                  featuresToTest = featuresToTest.concat(cssFeatures);
              }
              
              return featuresToTest.map(function(feature) {
                  return {
                      name: feature.name,
                      version: feature.version,
                      description: feature.description || '',
                      supported: testFeature(feature)
                  };
              });
          }
      };

  } catch (error) {
      // 收集浏览器信息
      const browserInfo = (function() {
          try {
              const ua = navigator.userAgent;
              return {
                  browser: 'Unknown',
                  version: 'Unknown',
                  userAgent: ua,
                  platform: navigator.platform || 'Unknown'
              };
          } catch (e) {
              return {
                  browser: 'Unknown',
                  version: 'Unknown',
                  userAgent: '获取失败',
                  platform: '获取失败'
              };
          }
      })();

      // 构建错误信息
      const errorMessage = `
插件初始化失败: ${error.message || '未知错误'}

浏览器信息:
- 浏览器: ${browserInfo.browser}
- 版本: ${browserInfo.version}
- 平台: ${browserInfo.platform}
- UserAgent: ${browserInfo.userAgent}

请尝试升级浏览器或联系技术支持。
      `.trim();

      // 显示错误提示
      try {
          alert(errorMessage);
      } catch (alertError) {
          // 极端情况下alert也可能失败，降级到控制台输出
          console.error('插件初始化失败:', error);
          console.error('浏览器信息:', browserInfo);
      }

      // 暴露错误信息到window供外部检测
      window.ftError = {
          message: error.message || '未知错误',
          stack: error.stack || '无堆栈信息',
          browserInfo: browserInfo,
          timestamp: new Date().toISOString()
      };
  }
})(window);