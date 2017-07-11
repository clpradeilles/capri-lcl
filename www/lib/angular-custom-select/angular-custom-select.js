(function(){angular.module("angular-custom-select",[]).directive("customSelect",function($compile){return{require:"ngModel",restrict:"E",scope:!0,compile:function(){return function(scope,iElem,iAttrs,ngModel){var collectionName,disabledAttribute,disabledClass,expandedClass,labelExpression,ngModelName,ngOptionParts,ngOptions,objectExpression,optionClass,optionScopes,optionValueWrapperClass,placeholderClass,placeholderLabel,removeElementsAndOptionScopes,selectClass,valueName;return selectClass=iAttrs.selectClass||"custom-select",optionClass=iAttrs.optionClass||"option",optionValueWrapperClass=iAttrs.optionValueWrapperClass||"value",expandedClass=iAttrs.expandedClass||"expanded",placeholderClass=iAttrs.placeholderClass||"placeholder",placeholderLabel=iAttrs.placeholder||"Select a value...",disabledAttribute=iAttrs.disabledAttribute||null,disabledClass=iAttrs.disabledClass||"disabled",ngModelName=iAttrs.ngModel,ngOptions=iAttrs.ngOptions.trim(),ngOptionParts=ngOptions.match(/^\s*([\w.]*)\s*(as)?\s*([\w.]*)\s*(for)\s*([\w.]*)\s*(in)\s*(\w.*)/),objectExpression=ngOptionParts[1],labelExpression=ngOptionParts[3]||objectExpression,valueName=ngOptionParts[5],collectionName=ngOptionParts[7],scope.expanded=!1,scope.onOutsideClick=function(){return scope.expanded=!1,scope.$apply()},scope.onPlaceholderClick=function($event){return $event.stopPropagation(),scope.expanded=!scope.expanded},scope.onItemClick=function(item,$event){return $event.stopPropagation(),disabledAttribute&&item[disabledAttribute]?void 0:(ngModel.$setViewValue(item),scope.expanded=!1)},scope.formatItemValue=function(item){var firstDotIndex;return item?(firstDotIndex=labelExpression.indexOf("."),-1===firstDotIndex?item:item[labelExpression.substr(firstDotIndex+1)]):null},optionScopes=[],removeElementsAndOptionScopes=function(){var optionScope,_i,_len;if(optionScopes.length){for(_i=0,_len=optionScopes.length;_len>_i;_i++)optionScope=optionScopes[_i],optionScope.$destroy();optionScopes=[]}return iElem.empty()},scope.$watchCollection(collectionName,function(collection){var compiledOptionHTML,compiledSelectHTML,i,item,optionHTML,optionScope,selectHTML,_i,_len,_results;for(removeElementsAndOptionScopes(),selectHTML="<div class='"+selectClass+"'",selectHTML+=" ng-class='{ \""+expandedClass+"\": expanded }'>",selectHTML+="</div>",compiledSelectHTML=$compile(selectHTML)(scope),iElem.append(compiledSelectHTML),optionHTML="<div class='"+placeholderClass+" "+optionClass+"'",optionHTML+=" ng-mousedown='onPlaceholderClick($event)'>",optionHTML+="<span class='"+optionValueWrapperClass+"'>",optionHTML+="{{ formatItemValue("+ngModelName+") || '"+placeholderLabel+"' }}",optionHTML+="</span>",optionHTML+="</div>",optionScope=scope.$new(),compiledOptionHTML=$compile(optionHTML)(optionScope),compiledSelectHTML.append(compiledOptionHTML),optionScopes.push(optionScope),_results=[],i=_i=0,_len=collection.length;_len>_i;i=++_i)item=collection[i],optionHTML="<div class='"+optionClass+"'",disabledAttribute&&disabledClass&&(optionHTML+=" ng-class='{ \""+disabledClass+'": '+objectExpression+"."+disabledAttribute+" }'"),optionHTML+=" ng-mousedown='onItemClick("+objectExpression+", $event)'>",optionHTML+="<span class='"+optionValueWrapperClass+"'>",optionHTML+="{{ "+labelExpression+" }}",optionHTML+="</span>",optionHTML+="</div>",optionScope=scope.$new(),optionScope[valueName]=item,compiledOptionHTML=$compile(optionHTML)(optionScope),compiledSelectHTML.append(compiledOptionHTML),_results.push(optionScopes.push(optionScope));return _results}),document.body.addEventListener("mousedown",scope.onOutsideClick),scope.$on("$destroy",function(){return document.body.removeEventListener("mousedown",scope.onOutsideClick),removeElementsAndOptionScopes()})}}}})}).call(this);

