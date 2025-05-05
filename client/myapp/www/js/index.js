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
		localStorage.removeItem("deletedCount");

		$("#loginForm").submit();

		if (localStorage.inputData != null) {

			var inputData = JSON.parse(localStorage.getItem("inputData"));

			$.post(domainUrl + "/verifyUserCredential", inputData,  function(data, status) {

				if (debug) alert("Data received: " + JSON.stringify(data));
				if (debug) alert("\nStatus: " + status);
				
				if (Object.keys(data).length > 0) {
					  // Store user info in localStorage
  					localStorage.setItem("loggedInUser", JSON.stringify({ email: inputData.email }));
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
	

	// Signup page
	let debug = true;
	
	$('#signupButton').click(function () {
	  localStorage.removeItem("signupData");
	  localStorage.removeItem("deletedCount");
	  $("#signupForm").submit();
	
	  if (localStorage.signupData != null) {
		var inputData = JSON.parse(localStorage.getItem("signupData"));
	
		// Check for duplicate email
		$.get(domainUrl + "/checkUserEmail?email=" + encodeURIComponent(inputData.email), function (data, status) {
		  if (debug) alert("Check email status: " + status);
	
		  if (data.exists) {
			alert("Email already registered!");
		  } else {
			// Register user
			$.post(domainUrl + "/registerUser", inputData, function (data, status) {
			  if (debug) alert("Sign up response: " + JSON.stringify(data));
			  if (data.success) {
				  // Store user info in localStorage
  				localStorage.setItem("loggedInUser", JSON.stringify({ email: inputData.email }));
				alert("Sign up successful!");
				$("body").pagecontainer("change", "#homePage");
			  } else {
				alert("Sign up failed.");
			  }
	
			  $("#signupForm").trigger("reset");
			});
		  }
		});
	  }
	});
	
	$("#clearButton").click(function () {
	  $("#signupForm").trigger("reset");
	});
	
	// Validation rules
	$("#signupForm").validate({
	  focusInvalid: false,
	  onkeyup: false,
	  submitHandler: function (form) {
		var formData = $(form).serializeArray();
		var inputData = {};
		formData.forEach(function (data) {
		  inputData[data.name] = data.value;
		});
	
		localStorage.setItem("signupData", JSON.stringify(inputData));
	  },
	  rules: {
		signupEmail: {
		  required: true,
		  email: true
		},
		password: {
		  required: true,
		  rangelength: [3, 10]
		},
		firstName: {
		  required: true
		},
		lastName: {
		  required: true
		},
		state: {
		  required: true
		},
		phoneNumber: {
		  required: true,
		  minlength: 10,
		  digits: true

		},
		address: {
		  required: true
		},
		postcode: {
		  required: true,
		  digits: true,
		  minlength: 4,
		  maxlength: 4
		}
	  },
	  messages: {
		signupEmail: {
		  required: "Please enter your email",
		  email: "The email format is incorrect"
		},
		password: {
		  required: "The password cannot be empty",
		  rangelength: $.validator.format("Minimum Password Length: {0}, Maximum Password Length: {1}")
		},
		firstName: {
		  required: "First name is required"
		},
		lastName: {
		  required: "Last name is required"
		},
		state: {
		  required: "Please enter your state"
		},
		phoneNumber: {
		  required: "Phone number is required",
		  minlength: "Phone number must be at least 10 digits"
		},
		address: {
		  required: "Address is required"
		},
		postcode: {
		  minlength: "Postcode must be 4 digits",
		  maxlength: "Postcode must be 4 digits"
		}
	  }
	});
	//   End of signup page

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

// to view the order list page

/**
----------Event handler to populate the Order List page before it is displayed---------------------
**/

$(document).on("pagebeforeshow", "#orderListPage", function () {
	$('#orderList').html("");

	const user = JSON.parse(localStorage.getItem("loggedInUser"));
	if (!user || !user.email) {
		$('#orderList').html("<h3>No user logged in.</h3>");
		return;
	}

	$.get(domainUrl + "/getUserOrders?customerEmail=" + encodeURIComponent(user.email), function (data, status) {
		if (status === "success" && data.length > 0) {
			data.forEach(function (orderInfo) {
				$('#orderList').append(`<br><table><tbody>`);
				$('#orderList').append(`<tr><td><strong>Order No:</strong></td><td><span class="fcolor">${orderInfo.orderNo}</span></td></tr>`);
				$('#orderList').append(`<tr><td><strong>Customer:</strong></td><td><span class="fcolor">${orderInfo.customerEmail || orderInfo.customerEmail}</span></td></tr>`);
				$('#orderList').append(`<tr><td><strong>Item:</strong></td><td><span class="fcolor">${orderInfo.itemName}</span></td></tr>`);
				$('#orderList').append(`<tr><td><strong>Price:</strong></td><td><span class="fcolor">${orderInfo.itemPrice || orderInfo.itemPrice}</span></td></tr>`);
				$('#orderList').append(`<tr><td><strong>Recipient:</strong></td><td><span class="fcolor">${orderInfo.firstName || ''} ${orderInfo.lastName || ''}</span></td></tr>`);
				$('#orderList').append(`<tr><td><strong>Phone:</strong></td><td><span class="fcolor">${orderInfo.recipient?.phone || orderInfo.phoneNumber}</span></td></tr>`);
				$('#orderList').append(`<tr><td><strong>Address:</strong></td><td><span class="fcolor">${orderInfo.address || ''}, ${orderInfo.postcode || ''}</span></td></tr>`);
				$('#orderList').append(`<tr><td><strong>Dispatch Date:</strong></td><td><span class="fcolor">${orderInfo.deliveryDate || orderInfo.date}</span></td></tr>`);
				$('#orderList').append(`</tbody></table><hr>`);
			});
		} else {
			$('#orderList').html("<h3>No past orders found.</h3>");
		}
	});
});

$(document).on("click", "#DeleteOrders", function (e) {
	e.preventDefault();
	console.log("See and delete orders triggered");
	const user = JSON.parse(localStorage.getItem("loggedInUser"));
	const user2 = JSON.parse(localStorage.getItem("loggedInUser"));

	if (!user || !user.email) {
		console.log(user);
		alert("User not logged in.");
		return;
	}

	$.ajax({
		url: domainUrl + "/deleteUserOrders?email=" + encodeURIComponent(user.email),
		type: "DELETE",
		success: function (response) {
			if (response.deletedCount > 0) {
				localStorage.setItem("deletedCount", response.deletedCount);
				$.mobile.changePage("#deleteConfirmationPage");
				console.log("Orders deleted successfully: " + response.deletedCount);
			} else {
				$.mobile.changePage("#deleteConfirmationPage");
			}
		},
		error: function () {
			alert("Error deleting orders.");
		}
	});
});

$(document).on("pagebeforeshow", "#deleteConfirmationPage", function () {
	const count = localStorage.getItem("deletedCount") || 0;
	$("#deleteMsg").html(`<strong>${count}</strong> order(s) have been deleted.`);
});


/**
--------------------------end--------------------------
**/