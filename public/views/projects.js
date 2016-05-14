define([
	"app",
	"models/projects",
	"models/users",
	"models/teams"
],function(app, projects, users, teams){

	var toolbar = {
		css: "app-editor-header", height:42, paddingY: 5, paddingX: 5, cols:[
			{ }, { view:"button", value:"Add new", width:150, css:"app:button", click:function(){
				webix.message("add project");
			}}
		]
	};

	var table = {
		view:"datatable",
		id:"projects:table",
		headerRowHeight:40,
		rowHeight:28,
		editable:true,
		columns:[
			{ id:"name", header:["Name", {content:"textFilter"}], editor:"text", sort:"string", fillspace:1},
			{ id:"user_id", header:["Creator", {content:"textFilter"}], editor:"richselect", collection:users.collection, sort:"string", fillspace:1 },
			{ id:"team_id", header:["Shared to team", {content:"textFilter"}], editor:"richselect", collection:teams.collection, sort:"string", fillspace:1},
			{ id:"modified", header:"Last Modified", format:webix.Date.dateToStr("%d-%m-%Y %H:%i"), fillspace:1 },
			{ id:"created", header:"Created", format:webix.Date.dateToStr("%d-%m-%Y %H:%i"), fillspace:1 },
			{ id:"designs", header:{ text:"Designs", rotate:true}, template:"<span class='webix_icon fa-file-code-o'></span>", width:35 },
			{ id:"", header:"", template:function(obj){
				return "<span class='webix_icon fa-"+(obj.deleted?"repeat":"trash")+"'></span>";
			}, width:35},
		],
		onClick:{
			"webix_icon":function(e, id){
				if(id.column)
					app.show("/top/"+id.column+":project="+id.row);
				else{
					var user = this.getItem(id);
					webix.confirm({
						text:"You are going to "+(user.deleted?"restore":"remove")+" this project.<br> Are you sure?",
						callback:webix.bind(function(res){
							if(res)
								this.updateItem(id, {deleted:user.deleted?0:1});
						}, this)
					});
				}
			}
		}
	};

	return {
		$ui:{rows:[
			toolbar, table
		]},
		$oninit:function(view, $scope){
			$$("projects:table").sync(projects.collection);
		},
		$onurlchange:function(config){
			if(config.team || config.user)
				projects.collection.waitData.then(function(obj){
					$$("projects:table").filter(function(obj){
						return (!config.team || obj.team_id === config.team) &&
							(!config.user || obj.user_id === config.user);
					});
				});
		}
	};

});