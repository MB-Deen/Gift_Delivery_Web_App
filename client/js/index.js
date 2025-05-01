// Server base domain url 
const domainUrl = "http://localhost:3000";  // if local test, please use this 

//==================================index.html==================================//

var debug = true;
var authenticated = false;


$(document).ready(function () {
	
/**
	----------------------Event handler to process login request----------------------
**/
   
	$('#loginButton').click(function () {

		localStorage.removeItem("inputData");

		$("#loginForm").submit();

		if (localStorage.inputData != null) {

			var inputData = JSON.parse(localStorage.getItem("inputData"));

			$.post(domainUrl + "/verifyUserCredential", inputData,  function(data, status) {

				if (debug) alert("Data received: " + JSON.stringify(data));
				if (debug) alert("\nStatus: " + status);
				
				if (Object.keys(data).length > 0) {
					alert("Login success");
					authenticated = true;
					localStorage.setItem("userInfo", JSON.stringify(data));	
					$("body").pagecontainer("change", "#homePage");
				} 
				else {
					alert("Login failed");
				}

				$("#loginForm").trigger('reset');	
			})
		}
		
	})


	$("#loginForm").validate({ // jQuery validation plugin
		focusInvalid: false,  
		onkeyup: false,
		submitHandler: function (form) {   
				
			var formData =$(form).serializeArray();
			var inputData = {};
			formData.forEach(function(data){
				inputData[data.name] = data.value;
			})

			localStorage.setItem("inputData", JSON.stringify(inputData));		

		},
		/* Validation rules */
		rules: {
			email: {
				required: true,
				email: true
			},
			password: {
				required: true,
				rangelength: [3, 10]
			}
		},
		/* Validation message */
		messages: {
			email: {
				required: "Please enter your email",
				email: "The email format is incorrect  "
			},
			password: {
				required: "The password cannot be empty",
				rangelength: $.validator.format("Minimum Password Length:{0}, Maximum Password Length:{1}。")

			}
		},
	});
	/**
	--------------------------end--------------------------
	**/	
	
	/**
	------------Event handler to respond to selection of gift category-------------------
	**/

	$('#itemList li').click(function () {
		
		var itemName = $(this).find('#itemName').html();
		var itemPrice = $(this).find('#itemPrice').html();
		var itemImage = $(this).find('#itemImage').attr('src');

		localStorage.setItem("itemName", itemName);
		localStorage.setItem("itemPrice", itemPrice);
		localStorage.setItem("itemImage", itemImage);
	}) 

	/**
	--------------------------end--------------------------
	**/	
	
	/**
	--------------------Event handler to process order submission----------------------
	**/

	$('#confirmOrderButton').click(function () {
		
		localStorage.removeItem("inputData");

		$("#orderForm").submit();

		if (localStorage.inputData != null) {
		
			var orderInfo = JSON.parse(localStorage.getItem("inputData"));

			orderInfo.itemName = localStorage.getItem("itemName");
			orderInfo.itemPrice = localStorage.getItem("itemPrice");
			orderInfo.itemImage = localStorage.getItem("itemImage");
			
			var userInfo = JSON.parse(localStorage.getItem("userInfo"));
			orderInfo.customerEmail = userInfo.email;

			orderInfo.orderNo = Math.trunc(Math.random()*900000 + 100000);

			localStorage.setItem("orderInfo", JSON.stringify(orderInfo));
			if (debug) alert(JSON.stringify(orderInfo));

			$.post(domainUrl + "/insertOrderData", orderInfo, function(data, status) {
				if (debug) alert("Data sent: " + JSON.stringify(data));
				if (debug) alert("\nStatus: " + status);
			
				//clear form data 
				$("#orderForm").trigger('reset');
				$("body").pagecontainer("change" , "#orderConfirmationPage");
	
			});		
		}

	})


	$("#orderForm").validate({  // jQuery validation plugin
		focusInvalid: false, 
		onkeyup: false,
		submitHandler: function (form) {   
			
			var formData =$(form).serializeArray();
			var inputData = {};

			formData.forEach(function(data){
				inputData[data.name] = data.value;
			});
			
			if (debug) alert(JSON.stringify(inputData));

			localStorage.setItem("inputData", JSON.stringify(inputData));
					
		},
		
		/* validation rules */
		
		rules: {
			firstName: {
				required: true,
				rangelength: [1, 15],
				validateName: true
			},
			lastName: {
				required: true,
				rangelength: [1, 15],
				validateName: true
			},
			phoneNumber: {
				required: true,
				mobiletxt: true
			},
			address: {
				required: true,
				rangelength: [1, 25]
			},
			postcode: {
				required: true,
				posttxt: true
			},/*
			oDate: {
				required: true,
				datetime: true
			},*/
		},
		/* Validation Message */

		messages: {
			firstName: {
				required: "Please enter your firstname",
				rangelength: $.validator.format("Contains a maximum of{1}characters"),

			},
			lastName: {
				required: "Please enter your lastname",
				rangelength: $.validator.format("Contains a maximum of{1}characters"),
			},
			phoneNumber: {
				required: "Phone number required",
			},
			address: {
				required: "Delivery address required",
				rangelength: $.validator.format("Contains a maximum of{1}characters"),
			},
			postcode: {
				required: "Postcode required",

			}		
		}
	});

	/**
	--------------------------end--------------------------
	**/


	/**
	--------------------Event handler to perform initialisation before the Login page is displayed--------------------
	**/

	$(document).on("pagebeforeshow", "#loginPage", function() {
	
		localStorage.removeItem("userInfo");
		
		authenticated = false;
	
	});  
	
	/**
	--------------------------end--------------------------
	**/	

	/**
	--------------------Event handler to populate the Fill Order page before it is displayed---------------------
	**/

	
	$(document).on("pagecreate", "#fillOrderPage", function() {
		
		$("#itemSelected").html(localStorage.getItem("itemName"));
		$("#priceSelected").html(localStorage.getItem("itemPrice"));
		$("#imageSelected").attr('src', localStorage.getItem("itemImage"));
	
	});  
	
	/**
	--------------------------end--------------------------
	**/	

	/**
	--------------------Event handler to populate the Order Confirmation page before it is displayed---------------------
	**/
	 
	$(document).on("pagebeforeshow", "#orderConfirmationPage", function() {
		
		$('#orderInfo').html("");

		if (localStorage.orderInfo != null) {
	
			var orderInfo = JSON.parse(localStorage.getItem("orderInfo"));
	
			$('#orderInfo').append(`<br><table><tbody>`);
			$('#orderInfo').append(`<tr><td>Order no: </td><td><span class=\"fcolor\"> ${orderInfo.orderNo} </span></td></tr>`);	
			$('#orderInfo').append(`<tr><td>Customer: </td><td><span class=\"fcolor\"> ${orderInfo.customerEmail} </span></td></tr>`);	
			$('#orderInfo').append(`<tr><td>Item: </td><td><span class=\"fcolor\"> ${orderInfo.itemName}  </span></td></tr>`);	
			$('#orderInfo').append(`<tr><td>Price: </td><td><span class=\"fcolor\"> ${orderInfo.itemPrice} </span></td></tr>`);
			$('#orderInfo').append(`<tr><td>Recipient: </td><td><span class=\"fcolor\"> ${orderInfo.firstName} ${orderInfo.lastName}</span></td></tr>`);
			$('#orderInfo').append(`<tr><td>Phone number: </td><td><span class=\"fcolor\"> ${orderInfo.phoneNumber} </span></td></tr>`);
			$('#orderInfo').append(`<tr><td>Address: </td><td><span class=\"fcolor\"> ${orderInfo.address} ${orderInfo.postcode} </span></td></tr>`);
			$('#orderInfo').append(`<tr><td>Dispatch date: </td><td><span class=\"fcolor\"> ${orderInfo.date} </span></td></tr>`);
			$('#orderInfo').append(`</tbody></table><br>`);
		}
		else {
			$('#orderInfo').append('<h3>There is no order to display<h3>');
		}
	});  

	/**
	--------------------------end--------------------------
	**/	

});



