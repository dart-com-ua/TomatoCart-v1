Ext.ux.FileUploader=function(a){Ext.apply(this,a);Ext.ux.FileUploader.superclass.constructor.apply(this,arguments);this.addEvents("beforeallstart","allfinished","beforefilestart","filefinished","progress")};Ext.extend(Ext.ux.FileUploader,Ext.util.Observable,{baseParams:{cmd:"upload",dir:"."},concurrent:true,enableProgress:true,jsonErrorText:"Cannot decode JSON object",maxFileSize:524288,progressIdName:"UPLOAD_IDENTIFIER",progressInterval:2000,progressUrl:"progress.php",progressMap:{bytes_total:"bytesTotal",bytes_uploaded:"bytesUploaded",est_sec:"estSec",files_uploaded:"filesUploaded",speed_average:"speedAverage",speed_last:"speedLast",time_last:"timeLast",time_start:"timeStart"},singleUpload:false,unknownErrorText:"Unknown error",upCount:0,createForm:function(a){var c=parseInt(Math.random()*10000000000,10);var b=Ext.getBody().createChild({tag:"form",action:this.url,method:"post",cls:"x-hidden",id:Ext.id(),cn:[{tag:"input",type:"hidden",name:"APC_UPLOAD_PROGRESS",value:c},{tag:"input",type:"hidden",name:this.progressIdName,value:c},{tag:"input",type:"hidden",name:"MAX_FILE_SIZE",value:this.maxFileSize}]});if(a){a.set("form",b);a.set("progressId",c)}else{this.progressId=c}return b},deleteForm:function(b,a){b.remove();if(a){a.set("form",null)}},fireFinishEvents:function(a){if(true!==this.eventsSuspended&&!this.singleUpload){this.fireEvent("filefinished",this,a&&a.record)}if(true!==this.eventsSuspended&&0===this.upCount){this.stopProgress();this.fireEvent("allfinished",this)}},getIframe:function(a){var b=null;var c=a.get("form");if(c&&c.dom&&c.dom.target){b=Ext.get(c.dom.target)}return b},getOptions:function(a,c){var b={url:this.url,method:"post",isUpload:true,scope:this,callback:this.uploadCallback,record:a,params:this.getParams(a,c)};return b},getParams:function(a,c){var b={path:this.path};Ext.apply(b,this.baseParams||{},c||{});return b},processSuccess:function(c,b,d){var a=false;if(this.singleUpload){this.store.each(function(e){e.set("state","done");e.set("error","");e.commit()})}else{a=c.record;a.set("state","done");a.set("error","");a.commit()}this.deleteForm(c.form,a)},processFailure:function(e,c,d){var a=e.record;var b;if(this.singleUpload){b=this.store.queryBy(function(f){var g=f.get("state");return"done"!==g&&"uploading"!==g});b.each(function(f){var g=d.errors?d.errors[f.id]:this.unknownErrorText;if(g){f.set("state","failed");f.set("error",g);Ext.getBody().appendChild(f.get("input"))}else{f.set("state","done");f.set("error","")}f.commit()},this);this.deleteForm(e.form)}else{if(d&&"object"===Ext.type(d)){a.set("error",d.errors&&d.errors[a.id]?d.errors[a.id]:this.unknownErrorText)}else{if(d){a.set("error",d)}else{if(c&&c.responseText){a.set("error",c.responseText)}else{a.set("error",this.unknownErrorText)}}}a.set("state","failed");a.commit()}},requestProgress:function(){var a,b;var c={url:this.progressUrl,method:"post",params:{},scope:this,callback:function(f,i,d){var h;if(true!==i){return}try{h=Ext.decode(d.responseText)}catch(g){return}if("object"!==Ext.type(h)||true!==h.success){return}if(this.singleUpload){this.progress={};for(b in h){if(this.progressMap[b]){this.progress[this.progressMap[b]]=parseInt(h[b],10)}}if(true!==this.eventsSuspended){this.fireEvent("progress",this,this.progress)}}else{for(b in h){if(this.progressMap[b]&&f.record){f.record.set(this.progressMap[b],parseInt(h[b],10))}}if(f.record){f.record.commit();if(true!==this.eventsSuspended){this.fireEvent("progress",this,f.record.data,f.record)}}}this.progressTask.delay(this.progressInterval)}};if(this.singleUpload){c.params[this.progressIdName]=this.progressId;c.params.APC_UPLOAD_PROGRESS=this.progressId;Ext.Ajax.request(c)}else{a=this.store.query("state","uploading");a.each(function(d){c.params[this.progressIdName]=d.get("progressId");c.params.APC_UPLOAD_PROGRESS=c.params[this.progressIdName];c.record=d;(function(){Ext.Ajax.request(c)}).defer(250)},this)}},setPath:function(a){this.path=a},setUrl:function(a){this.url=a},startProgress:function(){if(!this.progressTask){this.progressTask=new Ext.util.DelayedTask(this.requestProgress,this)}this.progressTask.delay.defer(this.progressInterval/2,this.progressTask,[this.progressInterval])},stopProgress:function(){if(this.progressTask){this.progressTask.cancel()}},stopAll:function(){var a=this.store.query("state","uploading");a.each(this.stopUpload,this)},stopUpload:function(a){var b=false;if(a){b=this.getIframe(a);this.stopIframe(b);this.upCount--;this.upCount=0>this.upCount?0:this.upCount;a.set("state","stopped");this.fireFinishEvents({record:a})}else{if(this.form){b=Ext.fly(this.form.dom.target);this.stopIframe(b);this.upCount=0;this.fireFinishEvents()}}},stopIframe:function(a){if(a){try{a.dom.contentWindow.stop();a.remove.defer(250,a)}catch(b){}}},upload:function(){var a=this.store.queryBy(function(b){return"done"!==b.get("state")});if(!a.getCount()){return}if(true!==this.eventsSuspended&&false===this.fireEvent("beforeallstart",this)){return}if(this.singleUpload){this.uploadSingle()}else{a.each(this.uploadFile,this)}if(true===this.enableProgress){this.startProgress()}},uploadCallback:function(b,f,a){var d;this.upCount--;this.form=false;if(true===f){try{d=Ext.decode(a.responseText)}catch(c){this.processFailure(b,a,this.jsonErrorText);this.fireFinishEvents(b);return}if(true===d.success){this.processSuccess(b,a,d)}else{this.processFailure(b,a,d)}}else{this.processFailure(b,a)}this.fireFinishEvents(b)},uploadFile:function(a,e){if(true!==this.eventsSuspended&&false===this.fireEvent("beforefilestart",this,a)){return}var c=this.createForm(a);var b=a.get("input");b.set({name:b.id});c.appendChild(b);var d=this.getOptions(a,e);d.form=c;a.set("state","uploading");a.set("pctComplete",0);this.upCount++;Ext.Ajax.request(d);this.getIframe.defer(100,this,[a])},uploadSingle:function(){var a=this.store.queryBy(function(d){return"done"!==d.get("state")});if(!a.getCount()){return}var b=this.createForm();a.each(function(d){var e=d.get("input");e.set({name:e.id});b.appendChild(e);d.set("state","uploading")},this);var c=this.getOptions();c.form=b;this.form=b;this.upCount++;Ext.Ajax.request(c)}});Ext.reg("fileuploader",Ext.ux.FileUploader);Ext.namespace("Ext.ux.form");Ext.ux.form.BrowseButton=Ext.extend(Ext.Button,{inputFileName:"file",debug:false,FLOAT_EL_WIDTH:60,FLOAT_EL_HEIGHT:18,buttonCt:null,clipEl:null,floatEl:null,inputFileEl:null,originalHandler:null,originalScope:null,initComponent:function(){Ext.ux.form.BrowseButton.superclass.initComponent.call(this);this.originalHandler=this.handler;this.originalScope=this.scope;this.handler=null;this.scope=null},onRender:function(d,b){Ext.ux.form.BrowseButton.superclass.onRender.call(this,d,b);this.buttonCt=this.el.child(".x-btn-center em");this.buttonCt.position("relative");var c={position:"absolute",overflow:"hidden",top:"0px",left:"0px"};if(Ext.isIE){Ext.apply(c,{left:"-3px",top:"-3px"})}else{if(Ext.isGecko){Ext.apply(c,{left:"-3px",top:"-3px"})}else{if(Ext.isSafari){Ext.apply(c,{left:"-4px",top:"-2px"})}}}this.clipEl=this.buttonCt.createChild({tag:"div",style:c});this.setClipSize();this.clipEl.on({mousemove:this.onButtonMouseMove,mouseover:this.onButtonMouseMove,scope:this});this.floatEl=this.clipEl.createChild({tag:"div",style:{position:"absolute",width:this.FLOAT_EL_WIDTH+"px",height:this.FLOAT_EL_HEIGHT+"px",overflow:"hidden"}});if(this.debug){this.clipEl.applyStyles({"background-color":"green"});this.floatEl.applyStyles({"background-color":"red"})}else{this.clipEl.setOpacity(0)}var a=this.el.child(this.buttonSelector);a.on("focus",this.onButtonFocus,this);if(Ext.isIE){this.el.on("keydown",this.onButtonKeyDown,this)}this.createInputFile()},setClipSize:function(){if(this.clipEl){var b=this.buttonCt.getWidth();var a=this.buttonCt.getHeight();if(b===0||a===0){this.setClipSize.defer(100,this)}else{if(Ext.isIE){b=b+5;a=a+5}else{if(Ext.isGecko){b=b+6;a=a+6}else{if(Ext.isSafari){b=b+6;a=a+6}}}this.clipEl.setSize(b,a)}}},createInputFile:function(){this.floatEl.select("em").each(function(a){a.remove()});this.inputFileEl=this.floatEl.createChild({tag:"input",type:"file",size:1,name:this.inputFileName||Ext.id(this.el),tabindex:this.tabIndex,style:{position:"absolute",cursor:"pointer",right:"0px",top:"0px"}});this.inputFileEl=this.inputFileEl.child("input")||this.inputFileEl;this.inputFileEl.on({click:this.onInputFileClick,change:this.onInputFileChange,focus:this.onInputFileFocus,select:this.onInputFileFocus,blur:this.onInputFileBlur,scope:this});if(this.tooltip){if(typeof this.tooltip=="object"){Ext.QuickTips.register(Ext.apply({target:this.inputFileEl},this.tooltip))}else{this.inputFileEl.dom[this.tooltipType]=this.tooltip}}},onButtonFocus:function(a){if(this.inputFileEl){this.inputFileEl.focus();a.stopEvent()}},onButtonKeyDown:function(a){if(this.inputFileEl&&a.getKey()==Ext.EventObject.SPACE){this.inputFileEl.dom.click();a.stopEvent()}},onButtonMouseMove:function(b){var a=b.getXY();a[0]-=this.FLOAT_EL_WIDTH/2;a[1]-=this.FLOAT_EL_HEIGHT/2;this.floatEl.setXY(a)},onInputFileFocus:function(a){if(!this.isDisabled){this.el.addClass("x-btn-over")}},onInputFileBlur:function(a){this.el.removeClass("x-btn-over")},onInputFileClick:function(a){a.stopPropagation()},onInputFileChange:function(){if(this.originalHandler){this.originalHandler.call(this.originalScope,this)}},detachInputFile:function(b){var a=this.inputFileEl;if(typeof this.tooltip=="object"){Ext.QuickTips.unregister(this.inputFileEl)}else{this.inputFileEl.dom[this.tooltipType]=null}this.inputFileEl.removeAllListeners();this.inputFileEl=null;if(!b){this.createInputFile()}return a},getInputFile:function(){return this.inputFileEl},disable:function(){Ext.ux.form.BrowseButton.superclass.disable.call(this);this.inputFileEl.dom.disabled=true},enable:function(){Ext.ux.form.BrowseButton.superclass.enable.call(this);this.inputFileEl.dom.disabled=false}});Ext.reg("browsebutton",Ext.ux.form.BrowseButton);Ext.ux.UploadPanel=Ext.extend(Ext.Panel,{addIconCls:"add",addText:"Add",bodyStyle:"padding:2px",buttonsAt:"tbar",clickRemoveText:"Click to remove",clickStopText:"Click to stop",emptyText:"No files",enableProgress:true,errorText:"Error",fileCls:"file",fileQueuedText:"File <b>{0}</b> is queued for upload",fileDoneText:"File <b>{0}</b> has been successfully uploaded",fileFailedText:"File <b>{0}</b> failed to upload",fileStoppedText:"File <b>{0}</b> stopped by user",fileUploadingText:"Uploading file <b>{0}</b>",maxFileSize:524288,maxLength:18,removeAllIconCls:"icon-cross",removeAllText:"Remove All",removeIconCls:"icon-minus",removeText:"Remove",selectedClass:"ux-up-item-selected",singleUpload:false,stopAllText:"Stop All",stopIconCls:"icon-stop",uploadText:"Upload",uploadIconCls:"icon-upload",workingIconCls:"icon-working",initComponent:function(){var d={xtype:"browsebutton",text:this.addText+"...",iconCls:this.addIconCls,scope:this,handler:this.onAddFile};var b={xtype:"button",iconCls:this.uploadIconCls,text:this.uploadText,scope:this,handler:this.onUpload,disabled:true};var e={xtype:"button",iconCls:this.removeAllIconCls,tooltip:this.removeAllText,scope:this,handler:this.onRemoveAllClick,disabled:true};if("body"!==this.buttonsAt){this[this.buttonsAt]=[d,b,"->",e]}var a=[{name:"id",type:"text",system:true},{name:"shortName",type:"text",system:true},{name:"fileName",type:"text",system:true},{name:"filePath",type:"text",system:true},{name:"fileCls",type:"text",system:true},{name:"input",system:true},{name:"form",system:true},{name:"state",type:"text",system:true},{name:"error",type:"text",system:true},{name:"progressId",type:"int",system:true},{name:"bytesTotal",type:"int",system:true},{name:"bytesUploaded",type:"int",system:true},{name:"estSec",type:"int",system:true},{name:"filesUploaded",type:"int",system:true},{name:"speedAverage",type:"int",system:true},{name:"speedLast",type:"int",system:true},{name:"timeLast",type:"int",system:true},{name:"timeStart",type:"int",system:true},{name:"pctComplete",type:"int",system:true}];if(Ext.isArray(this.customFields)){a.push(this.customFields)}this.store=new Ext.data.SimpleStore({id:0,fields:a,data:[]});Ext.apply(this,{items:[{xtype:"dataview",itemSelector:"div.ux-up-item",store:this.store,selectedClass:this.selectedClass,singleSelect:true,emptyText:this.emptyText,tpl:this.tpl||new Ext.XTemplate('<tpl for="."><div class="ux-up-item"><div class="ux-up-icon-file {fileCls}">&#160;</div><div class="ux-up-text x-unselectable" qtip="{fileName}">{shortName}</div><div id="remove-{[values.input.id]}" class="ux-up-icon-state ux-up-icon-{state}"qtip="{[this.scope.getQtip(values)]}">&#160;</div></div></tpl>',{scope:this}),listeners:{click:{scope:this,fn:this.onViewClick}}}]});Ext.ux.UploadPanel.superclass.initComponent.apply(this,arguments);this.view=this.items.itemAt(0);this.addEvents("beforefileadd","fileadd","beforefileremove","fileremove","beforequeueclear","queueclear","beforeupload","allfinished");this.relayEvents(this.view,["beforeclick","beforeselect","click","containerclick","contextmenu","dblclick","selectionchange"]);var c={store:this.store,singleUpload:this.singleUpload,maxFileSize:this.maxFileSize,enableProgress:this.enableProgress,url:this.url,path:this.path};if(this.baseParams){c.baseParams=this.baseParams}this.uploader=new Ext.ux.FileUploader(c);this.relayEvents(this.uploader,["beforeallstart","allfinished","progress"]);this.on({beforeallstart:{scope:this,fn:function(){this.uploading=true;this.updateButtons()}},allfinished:{scope:this,fn:function(){this.uploading=false;this.updateButtons()}},progress:{fn:this.onProgress.createDelegate(this)}})},onRender:function(){Ext.ux.UploadPanel.superclass.onRender.apply(this,arguments);var a="tbar"===this.buttonsAt?this.getTopToolbar():this.getBottomToolbar();this.addBtn=Ext.getCmp(a.items.first().id);this.uploadBtn=Ext.getCmp(a.items.itemAt(1).id);this.removeAllBtn=Ext.getCmp(a.items.last().id)},getQtip:function(a){var b="";switch(a.state){case"queued":b=String.format(this.fileQueuedText,a.fileName);b+="<br>"+this.clickRemoveText;break;case"uploading":b=String.format(this.fileUploadingText,a.fileName);b+="<br>"+a.pctComplete+"% done";b+="<br>"+this.clickStopText;break;case"done":b=String.format(this.fileDoneText,a.fileName);b+="<br>"+this.clickRemoveText;break;case"failed":b=String.format(this.fileFailedText,a.fileName);b+="<br>"+this.errorText+":"+a.error;b+="<br>"+this.clickRemoveText;break;case"stopped":b=String.format(this.fileStoppedText,a.fileName);b+="<br>"+this.clickRemoveText;break}return b},getFileName:function(a){return a.getValue().split(/[\/\\]/).pop()},getFilePath:function(a){return a.getValue().replace(/[^\/\\]+$/,"")},getFileCls:function(a){var b=a.split(".");if(1===b.length){return this.fileCls}else{return this.fileCls+"-"+b.pop().toLowerCase()}},onAddFile:function(c){if(true!==this.eventsSuspended&&false===this.fireEvent("beforefileadd",this,c.getInputFile())){return}var a=c.detachInputFile();a.addClass("x-hidden");var d=this.getFileName(a);var b=new this.store.recordType({input:a,fileName:d,filePath:this.getFilePath(a),shortName:Ext.util.Format.ellipsis(d,this.maxLength),fileCls:this.getFileCls(d),state:"queued"},a.id);b.commit();this.store.add(b);this.syncShadow();this.uploadBtn.enable();this.removeAllBtn.enable();if(true!==this.eventsSuspended){this.fireEvent("fileadd",this,this.store,b)}this.doLayout()},onDestroy:function(){if(this.uploader){this.uploader.stopAll();this.uploader.purgeListeners();this.uploader=null}if(this.view){this.view.purgeListeners();this.view.destroy();this.view=null}if(this.store){this.store.purgeListeners();this.store.destroy();this.store=null}},onProgress:function(h,f,g){var e,d,i,a,j,k,b,c;if(g){a=g.get("state");e=g.get("bytesTotal")||1;d=g.get("bytesUploaded")||0;if("uploading"===a){i=Math.round(1000*d/e)/10}else{if("done"===a){i=100}else{i=0}}g.set("pctComplete",i);j=this.store.indexOf(g);k=Ext.get(this.view.getNode(j));if(k){b=k.getWidth();k.applyStyles({"background-position":b*i/100+"px"})}}},onRemoveFile:function(a){if(true!==this.eventsSuspended&&false===this.fireEvent("beforefileremove",this,this.store,a)){return}var d=a.get("input");var b=d.up("em");d.remove();if(b){b.remove()}this.store.remove(a);var c=this.store.getCount();this.uploadBtn.setDisabled(!c);this.removeAllBtn.setDisabled(!c);if(true!==this.eventsSuspended){this.fireEvent("fileremove",this,this.store);this.syncShadow()}},onRemoveAllClick:function(a){if(true===this.uploading){this.stopAll()}else{this.removeAll()}},stopAll:function(){this.uploader.stopAll()},onViewClick:function(a,b,d,f){var c=f.getTarget("div:any(.ux-up-icon-queued|.ux-up-icon-failed|.ux-up-icon-done|.ux-up-icon-stopped)");if(c){this.onRemoveFile(this.store.getAt(b))}c=f.getTarget("div.ux-up-icon-uploading");if(c){this.uploader.stopUpload(this.store.getAt(b))}},onUpload:function(){if(true!==this.eventsSuspended&&false===this.fireEvent("beforeupload",this)){return false}this.uploader.upload()},setUrl:function(a){this.url=a;this.uploader.setUrl(a)},setPath:function(a){this.uploader.setPath(a)},updateButtons:function(){if(true===this.uploading){this.addBtn.disable();this.uploadBtn.disable();this.removeAllBtn.setIconClass(this.stopIconCls);this.removeAllBtn.getEl().child(this.removeAllBtn.buttonSelector).dom[this.removeAllBtn.tooltipType]=this.stopAllText}else{this.addBtn.enable();this.uploadBtn.enable();this.removeAllBtn.setIconClass(this.removeAllIconCls);this.removeAllBtn.getEl().child(this.removeAllBtn.buttonSelector).dom[this.removeAllBtn.tooltipType]=this.removeAllText}},removeAll:function(){var a=this.eventsSuspended;if(false!==this.eventsSuspended&&false===this.fireEvent("beforequeueclear",this,this.store)){return false}this.suspendEvents();this.store.each(this.onRemoveFile,this);this.eventsSuspended=a;if(true!==this.eventsSuspended){this.fireEvent("queueclear",this,this.store)}this.syncShadow()},syncShadow:function(){if(this.contextmenu&&this.contextmenu.shadow){this.contextmenu.getEl().shadow.show(this.contextmenu.getEl())}}});Ext.reg("uploadpanel",Ext.ux.UploadPanel);