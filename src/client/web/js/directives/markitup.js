// markitup.js
angular.module('IronbaneApp')
.directive('markItUp', [function() {
    var bbcodeSettings = {
        previewParserPath:  '', // path to your BBCode parser
        markupSet: [
            {name:'Bold', key:'B', openWith:'[b]', closeWith:'[/b]'},
            {name:'Italic', key:'I', openWith:'[i]', closeWith:'[/i]'},
            {name:'Underline', key:'U', openWith:'[u]', closeWith:'[/u]'},
            {separator:'---------------' },
            {name:'Picture', key:'P', replaceWith:'[img][![Url]!][/img]'},
            {name:'Link', key:'L', openWith:'[url=[![Url]!]]', closeWith:'[/url]', placeHolder:'Your text to link here...'},
            {separator:'---------------' },
            {name:'Size', key:'S', openWith:'[size=[![Text size]!]]', closeWith:'[/size]',
            dropMenu :[
                {name:'Big', openWith:'[size=200]', closeWith:'[/size]' },
                {name:'Normal', openWith:'[size=100]', closeWith:'[/size]' },
                {name:'Small', openWith:'[size=50]', closeWith:'[/size]' }
            ]},
            {separator:'---------------' },
            {name:'Bulleted list', openWith:'[list]\n', closeWith:'\n[/list]'},
            {name:'Numeric list', openWith:'[list=[![Starting number]!]]\n', closeWith:'\n[/list]'},
            {name:'List item', openWith:'[*] '},
            {separator:'---------------' },
            {name:'Quotes', openWith:'[quote]', closeWith:'[/quote]'},
            {name:'Code', openWith:'[code]', closeWith:'[/code]'},
            {separator:'---------------' },
            {name:'Clean', className:"clean", replaceWith: function(markitup) { return markitup.selection.replace(/\[(.*?)\]/g, ""); } }
        ]
    };

    return {
        restrict: 'AE',
        replace: true,
        template: '<textarea></textarea>',
        link: function(scope, el, attrs) {
            el.markItUp(bbcodeSettings);
        }
    };
}]);