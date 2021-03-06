// Genomerator JS functions
little_box_w	= 7;
little_box_h	= 7;
current_frame	= 1;
current_image_data	= "";

num_boxes_w		= 50;
num_boxes_h		= 50;
no_move			= 0;
grid_data		= new Array();

function retrieve_index_of(test_array,value) {
	for(var o=0;o<test_array.length;o++) {
		if(test_array[o] == value) {
			return o;
		}
	}
	return false;
}


function retrieve_grid_location(frame_num) {

	// Retrieve the Index
	
	var index	= retrieve_index_of(grid_data,frame_num);
	
	// Get the base positions
	var	y	= 	(index > 0) ? Math.floor(index/num_boxes_w) : "0";
	var x	= 	(index > 0) ? index % num_boxes_w : "0";

	// Calculate the final positions
		x	=  little_box_w * x;
	y	= y * little_box_h;
	move_to_position(x,y);
}

function parse_cycle_row(data) {
	// Get the pieces
	if(data != "") {
		var pieces	= data.split(" ");
		if(pieces.length == 3) {
			var content = "<tr>\n<td class=\"blocks\" width=\"30\"><input type=\"checkbox\" id=\"cycles\" name=\"cycles[]\" value=\"" + pieces[0] + "\" /></td>";
			content	= content + "<td class=\"blocks\" width=\"30\" height=\"28\">" + pieces[0] + "</td>\n";
			content	= content + "<td class=\"blocks\" height=\"200\">\n";
			marker++;
				
			if(pieces[1] == 1) {
				content =  content + "<a href=\"JavaScript: load_fullsize_image('" + pieces[1] + "','" + pieces[2] + "','1','"+pieces[0]+"')\"><img src=\"images/1block.png\" width=\"33\" height=\"25\" border=\"0\" />"; 
			} else {
				content =  content + "<a href=\"JavaScript: load_fullsize_image('" + pieces[1] + "','" + pieces[2] + "','1','"+pieces[0]+"')\"><img src=\"images/1block.png\" width=\"33\" height=\"25\" border=\"0\" />"; 
				content =  content + "<a href=\"JavaScript: load_fullsize_image('" + pieces[1] + "','" + pieces[2] + "','2','"+pieces[0]+"')\"><img src=\"images/1block.png\" width=\"33\" height=\"25\" border=\"0\" />"; 
				content =  content + "<a href=\"JavaScript: load_fullsize_image('" + pieces[1] + "','" + pieces[2] + "','3','"+pieces[0]+"')\"><img src=\"images/1block.png\" width=\"33\" height=\"25\" border=\"0\" />"; 
				content =  content + "<a href=\"JavaScript: load_fullsize_image('" + pieces[1] + "','" + pieces[2] + "','4','"+pieces[0]+"')\"><img src=\"images/1block.png\" width=\"33\" height=\"25\" border=\"0\" />"; 
			}
			
			content = content + "</td>\n</tr>\n";
			return content;
		}
	} else {
		return "";
	}
	
}

function string_pad(input,num_chars,pad_char,pad_side) {
	var input_length	= input.length;
	var required_chars	= num_chars - input_length;
	var output = "";
	var content = "";
	var pad_char	= String(pad_char);
	var input		= String(input);
	
	if(required_chars > 0) {
		for(i=0;i<required_chars;i++) {
			content = content + String(pad_char);
		}
		
		content = String(content);
		if(pad_side == 'left') {
			output = content + input;
		} else {
			output = input + content;
		}
	} else {
		output = input;
	}
	
	return output;
}

function load_fullsize_image(num_images,location,current_position,cycle) {
	// Get the data
	var extension	= ((Number(current_frame) - 1) * Number(num_images)) + Number(current_position);
	var description	= "<span id=\"image_caption\">&nbsp;<br />Frame <b>" + current_frame + "</b> cycle <b>" + cycle + "</b> = image <b>" + current_position + "</b> - ";
	
	// Pad the extension if necessary
	var final_extension	= string_pad(String(extension),4,'0','left');
	var prefix = location + String(final_extension);
	description = description + prefix + ".jpg<br />&nbsp;</span>";
	
	current_image_data	= new Array(num_images,location,current_position,cycle);

	var extralinks = "<br/>Links to other formats: <ul>"
	+ "<li><a href=\""+prefix+".jpg\">full size jpeg</a>"
	+ "<li><a href=\""+prefix+".500.jpg\">500x500 jpeg</a>"
	+ "<li><a href=\""+prefix+".200.jpg\">200x200 jpeg</a>"
	+ "</ul><br/>&nbsp;";
	
	document.getElementById("right").innerHTML	= "<img src=\""+prefix+".jpg\" width=\"1000\" height=\"1000\" border=\"0\" alt=\""+prefix+".jpg\" />" + description + extralinks;
}

function display_cycle_list(cycle_data) {
	marker = 0;
	var content = "<table width=\"260\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">";
	for(var i = 0; i < cycle_data.length; i++) {
		content = content + parse_cycle_row(cycle_data[i]);
	}
	
	content = content + "</table>";
	
	// update the appropriate container
	document.getElementById("cycle_list").innerHTML	= content;
}

function load_cycle_list(sid) {
	dsid = sid;
	var xml_tunnel	= window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Msxml2.XMLHTTP");
	xml_tunnel.open('GET','/cyclelist.cgi?dsid='+dsid,true);
	xml_tunnel.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); 
	xml_tunnel.onreadystatechange = function() {
		if(xml_tunnel.readyState == 4 && xml_tunnel.status == 200) {
			var incoming = xml_tunnel.responseText;
			cycle_data	= incoming.split("\n");
			display_cycle_list(cycle_data);
		}
	}
	
	xml_tunnel.send(null);
}

function check_all_boxes(status) {
	var i=0;
	var id_field = document.download.cycles;
	var id_options = id_field.length;
	
	for(i=0;i<id_options;i++) {
		id_field[i].checked = status;
	}
}

function load_frame_data(sid) {
	dsid	= sid;
	
	var xml_tunnel	= window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Msxml2.XMLHTTP");
	xml_tunnel.open('GET','/framegrid.cgi?dsid='+dsid+';gridw=50;gridh=50',true);
	xml_tunnel.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); 
	xml_tunnel.onreadystatechange = function() {
		if(xml_tunnel.readyState == 4 && xml_tunnel.status == 200) {
			var incoming = xml_tunnel.responseText;
			grid_data	= incoming.split("\n");
			retrieve_grid_location(current_frame);
		}
	}
	
	xml_tunnel.send(null);
}



function move_little_box(x,y) {
	var little_box	= document.getElementById("little_box");
	little_box.style.width	= Number(little_box_w) + "px";
	little_box.style.height	= Number(little_box_h) + "px";

	little_box.style.display	= "block";
	little_box.style.left		= Number(x)+"px";
	little_box.style.top		= Number(y)+"px";
}


function move_to_position(final_x,final_y) {
	if(!no_move || no_move != 1) {
		
		var wrapper	= document.getElementById("wrap");
		var grid	= document.getElementById("grid_image");
		var left	= document.getElementById("left");

			// Get the Frame Number
			var line_number = ((final_x+little_box_w)/little_box_w) + (((final_y)/little_box_h)*(grid.clientWidth/little_box_w));
			if(grid_data.length >= line_number) {
				line_data		= grid_data[(line_number-1)]
			} else {
				line_data		= "-1";
			}
			
			
			if(line_data != '-1') {
				var location_box = document.getElementById("location_box");
				var frame_number	=	document.getElementById("frame_number");
				var frame_id		= document.getElementById("frame_id");
				
				frame_number.innerHTML	= line_data;
				current_frame	= line_data;
				frame_id.value	= current_frame;
				location_box.innerHTML	= "Location: X:" + final_x + "px  Y:" + final_y + "px   -  Frame Number: " +line_data;
			
				move_little_box(final_x,final_y);
				if(current_image_data.constructor == Array) load_fullsize_image(current_image_data[0],current_image_data[1],current_image_data[2],current_image_data[3]);
				
			}
	}
	no_move = 0;
}

function display_elements(e) {
	var x	= (e.x) ? e.x : e.layerX;
	var y	= (e.y) ? e.y : e.layerY+2;
	
	var wrapper	= document.getElementById("wrap");
	var grid	= document.getElementById("grid_image");
	var left	= document.getElementById("left");

	var offset_y	= Number(wrapper.offsetTop) + Number(grid.offsetTop) + Number(left.offsetTop);
	var offset_x	= wrapper.offsetLeft + grid.offsetLeft + left.offsetLeft;
	
	
	var regex	= /Safari/;
	if(navigator.userAgent.match(regex)) x = x - offset_x;
	y	= y - offset_y;

	if(y < 0) y=0;
	if(x >= grid.clientWidth) x = Number(grid.clientWidth)-Number(little_box_w);
	
	final_x	= Number(Math.round((x-(little_box_w/2))/little_box_w)*little_box_w);
	final_y	= Number(Math.round((y-(little_box_h/2))/little_box_h)*little_box_h);

	move_to_position(final_x,final_y);
}

function load_grid_image(location) {
	document.getElementById('grid_image').style.backgroundImage= "url('" +location+"')";
}

function squak_mouse_pos(event){
	var location_box = document.getElementById("location_box");
	location_box.innerHTML	= "Location: " + document.location.search;
} 

function flag_no_move() {
	no_move 	= 1;
}

function do_nothing() {}