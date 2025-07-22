# 菜单配置文件Markdown

## 前言：

### 当前版本: r-1.0.0-FF (1.0.0 Folder File Version)，版本号：210001

### 辅助插件列表：

File 部分：
    1. Featuredetector.js V1.0.0 浏览器兼容性检测插件

class Tools 部分：
    1. ShowToasts V1.0.0 消息提示插件
    2. ConvertXmlToJson

rtcmenu /* Action Tools */ 部分：
    1. copy (async)
    2. paste (async) 未测试
    3. showPluginInfo

## 文件内容：
```markdown

menus                      // 插件文件夹
    --- empty.svg          // 留空时默认图标
    --- featuredetector.js // 兼容性检测插件
    --- main.js         // 主运行文件
    --- menu.css           // 主样式文件
    --- menu.json          // 主菜单配置文件(json版)
    --- menu.xml           // 主菜单配置文件(xml版)
    --- readme.md          // 说明文件

```

## 代码使用方法：

注：路径下`url`均以opt的`rootOpt`为根目录

### menu.json使用方法注释

```jsonc
{
    "opts": {
        // 插件显示名称
        "name": "菜单插件配置",

        /*
        版本信息：
            a=alpha, b=beta, r=release
        版本类型：
            FF=Folder File, OF=Only Javascript File, MF=Min Javascript File
        */
        "version": "r-1.0.0-FF", 
        
        // 功能描述
        "description": "菜单描述",

        // 说明文档路径（基于rootOpt路径） 暂时没用处
        "readme": "./readme.md", 

        // 是否启用默认图标填充 (Boolean)
        "defaultSet": true, 

        // 是否为开发模式（控制action的调试信息输出） (Boolean)
        "isdev": false, 

        // 根路径（空值表示当前目录），可填/xx, ./xx, ../xx , xx
        "rootOpt": "" 
    },

    // 样式表路径（基于rootOpt路径）
    "styles": "menu.css",

    // 菜单配置（支持多级嵌套）
    "menus": {
        // 公共菜单（所有元素都会显示）
        "#public": [
            {
                // 菜单显示文本
                "name": "Public Example 1",

                // 菜单唯一标识符（推荐格式：菜单组.功能名）目前无用处
                "id": "public.test1", 

                /* 
                菜单左侧图标，目前可以填入：
                1. "" -> 无图标（但是受defaultSet影响）
                2. "icon.png" -> 菜单图标路径（当前目录为准）
                3. "#--icon-paste" -> :root 定义的图标
                4. "^https://example.com/icon.png" -> 网络图标
                5. "&" -> 无图标（固定为占位符）
                6. "@fa:fa-solid fa-xxx" -> FontAwesome图标，fa可以换成bi,fas,far,fab,mdi,ti(可以看const fontMap [main.js 238-246])
                7. "$/xx" -> 菜单图标路径（根目录为准）
                8. "./xx 或 ../xx" -> 菜单图标路径（当前目录为准）
                */

                "icon": "&",

                // 执行的JS函数（见main.js解析）
                "action": "",

                // 排除的菜单组（仅对#public项有效）
                "exc": ["mainMenu"]
            },
            {
                "name": "更多",
                "id": "public.more",
                "icon": "&",
                // 子菜单配置，与菜单配置一致
                "submenus": [
                    {
                        "name": "显示toast.success",
                        "id": "more.s_tst_s",
                        "icon": "@fa:fa-solid fa-folder-plus", 
                        /* 
                        执行代码，可填入：
                        1. this.xxx() 表示使用当前组件实例
                        2. await this.xxx() 表示异步使用当前组件实例

                        注意：必须在this.runScripts里面绑定
                        */
                        "action": "this.tst.s('toast success')"
                    }
                ]
            }
        ],

        // 主菜单组
        "mainMenu": [
            {
                "name": "复制（测试）",
                "id": "main.copy",
                "icon": "@fa:fa-solid fa-copy",
                "action": "await this.copy(this.selectT)" // 执行的动作函数
            },
            {
                "name": "粘贴（测试）",
                "id": "main.paste",
                "icon": "#icon-paste", // 使用CSS变量
                "action": "await this.paste(this.lastActiveEditableElement)"
            },
            {
                "name": "更多",
                "id": "main.more",
                "icon": "&",
                "submenus": [
                    {
                        "name": "创建文件夹",
                        "id": "more.create_folder",
                        "icon": "@fa:fa-solid fa-folder-plus", // Font Awesome图标
                        "action": "create_folder"
                    }
                ]
            }
        ],
        // any
    },

    /* 
    触发器配置（指定哪些元素触发哪些菜单），触发方式：
    "一个class或id": "要触发的菜单组名称"
    */
    "trigger": {
        ".main-content": "mainMenu",
        ".chat-history": "mainMenu",
        ".chat-container": "mainMenu"
    }
}
```

### menu.css注意事项：

```css
/* =============================================
 * MENU STYLE CONFIGURATION - 上下文菜单主样式
 * =============================================
 * 此文件定义了上下文菜单的整体样式和变量
 * 通过修改下面的变量可以轻松定制菜单外观
 */

/* =============================================
 * 基础变量配置 (可在主题中覆盖)
 * =============================================
 * 这些变量定义了菜单的基本外观和行为
 * 分为以下几类变量：
 * 1. 字体与文本
 * 2. 颜色系统
 * 3. 尺寸与间距
 * 4. 视觉效果
 * 5. 图标系统
 * 6. 子菜单配置
 *
 * 注：本插件提供:root.dark，注意可能会与你的其他代码冲突
 */
:root {
    /* --------------------------
     * 1. 字体与文本变量
     * -------------------------- */
    --rtc-font-family: "楷体", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; /* 菜单字体修改 */
    --rtc-font-size: 14px; /* 菜单字体大小修改 */
    --rtc-font-weight: normal; /* 菜单字体粗细修改 */
    --rtc-text-color: #444; /* 主文本颜色 */
    
    /* --------------------------
     * 2. 颜色系统变量
     * -------------------------- */
    --rtc-bg-color: rgba(255, 255, 255, 0.25); /* 菜单背景色 */
    --rtc-hover-bg: rgba(245, 245, 245, 0.85); /* 悬停背景色 */
    --rtc-active-bg: rgba(230, 230, 230, 0.95); /* 点击背景色 */
    --rtc-disabled-color: #aaa; /* 禁用项颜色 */
    --rtc-divider-color: rgba(220, 220, 220, 0.8); /* 分隔线颜色 */
    --rtc-placeholder-color: transparent; /* 占位符颜色 */
    
    /* --------------------------
     * 3. 尺寸与间距变量
     * -------------------------- */
    --rtc-border-radius: 8px; /* 圆角大小 */
    --rtc-icon-size: 16px; /* 图标尺寸 */
    --rtc-menu-min-width: 180px; /* 菜单最小宽度 */
    --rtc-menu-max-width: 280px; /* 菜单最大宽度 */
    --rtc-padding-vertical: 8px; /* 垂直内边距 */
    --rtc-padding-horizontal: 16px; /* 水平内边距 */
    
    /* --------------------------
     * 4. 视觉效果变量
     * -------------------------- */
    --rtc-box-shadow: 2px 4px 20px rgba(0, 0, 0, 0.25); /* 主阴影 */
    --rtc-backdrop-filter: blur(4px); /* 背景模糊效果 */
    --rtc-transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); /* 过渡动画 */
    --rtc-border-color: rgba(255, 255, 255, 0.1); /* 边框颜色 */
    
    /* --------------------------
     * 5. 图标系统变量
     * -------------------------- */
    --rtc-icon-opacity: 0.9; /* 图标默认透明度 */
    --rtc-icon-hover-opacity: 1; /* 图标悬停透明度 */
    --icon-paste: url(/plugins/menus/paste.svg); /* 粘贴图标 */
    --icon-empty: url(/plugins/menus/empty.svg); /* 空图标 */
    
    /* --------------------------
     * 6. 子菜单配置变量
     * -------------------------- */
    --rtc-submenu-offset: -6px; /* 子菜单垂直偏移 */
    --rtc-submenu-shadow: 3px 6px 20px rgba(0, 0, 0, 0.15); /* 子菜单阴影 */
}

/* =============================================
 * 暗色模式变量覆盖
 * ============================================= */
:root.dark {
    --rtc-text-color: #f0f0f0;
    --rtc-bg-color: rgba(40, 40, 40, 0.95);
    --rtc-hover-bg: rgba(70, 70, 70, 0.85);
    --rtc-active-bg: rgba(90, 90, 90, 0.95);
    --rtc-disabled-color: #777;
    --rtc-divider-color: rgba(80, 80, 80, 0.8);
    --rtc-box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    --rtc-submenu-shadow: 3px 6px 20px rgba(0, 0, 0, 0.35);
    --rtc-placeholder-color: rgba(255, 255, 255, 0.1);
}
 /* 其他代码 */

 /* =============================================
 * Toast样式覆盖
 *
 * 注：这里只是作为覆盖，不是修改，如果要仔细修改请在main.js的Tools._initToastStyles中修改
 * ============================================= */
```

### main.js注意事项：

#### 基本配置修改

```javascript
class Tools {
    // 插件代码...
}
class RTCMenu {
    constructor() {
        this.runpath = "脚本运行位置（不是文件）";
        this.runconf = "配置文件名字";

        // 如果你的函数有参数，可以将参数放在这里
        this.exampleString = null; // 示例

        // ...
        this.runScripts = Object.keys({
            tools: this.tools,
            tst: this.tst,
            // 绑定你写的函数，例如example: this.example.bind(this)
            debug: () => `可用方法:,${Object.keys(this.runScripts)}`
        });
    }

    // 其他menu设置代码...
    
    /* ---------- 菜单动作 ---------- */
    /* 
        为了方便修改，尽量都放在这里，json/xml中action这样写：
        "action": "this.example(this.exampleString)" //使用
    */
    async example(string) {
        //...
        // 推荐输出api接口return {runstat: true/false};
    } // 函数按正常写就行
}

document.addEventListener('DOMContentLoaded', () => {
    console.group('Compatibility Check');
    const compatResult = ft.test({ mode: 'j', impact: true, minver: 8 }); // 兼容性检测，数字可参考featuredetector.js的esVersionMap。最低兼容性没测，写了个es2017
    console.log('Max Supported Version:', compatResult.maxVer);
    console.log('Feature Support:', compatResult.impact);
    console.groupEnd();

    if (!compatResult.isPass) {
        console.group('Compatibility Error');
        console.error('当前浏览器不支持所需功能');
        console.log('建议升级到支持ES2020+的浏览器');
        console.groupEnd();
        return;
    }

    new RTCMenu(); // 使用menu插件
});
```



# 可以增加：
1. 增加对子项的自定义animation，自带的fade/slide/ease等动画
2. 对opt.defaultSet项增加自定义图标路径等