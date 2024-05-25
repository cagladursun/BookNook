const checkboxes = document.querySelectorAll('.selectable-shipment');
let selectedPrice = 0;
let control=false;
document.addEventListener('DOMContentLoaded', function () {
    checkboxes.forEach(checkbox => {
        const checkboxState = localStorage.getItem(checkbox.id);
        if (checkboxState === 'checked') {
            checkbox.checked = true;
            selectedPrice = parseFloat(checkbox.nextElementSibling.nextElementSibling.nextElementSibling.textContent.replace('$ ', ''));
            disableOtherCheckboxes(checkbox);
            control=true;
        } else if (checkboxState === 'disabled') {
            checkbox.disabled = true;
            
        } else {
            checkbox.checked = false;
            disableOtherCheckboxes(checkbox);
        }
    });
});

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        localStorage.setItem(checkbox.id, checkbox.checked ? 'checked' : 'unchecked');

        if (checkbox.checked) {
            disableOtherCheckboxes(checkbox);
            selectedPrice = parseFloat(checkbox.nextElementSibling.nextElementSibling.nextElementSibling.textContent.replace('$ ', ''));
            
            call(selectedPrice);
            
        } else {
            checkboxes.forEach(otherCheckbox => {
                otherCheckbox.disabled = false;
                localStorage.removeItem(otherCheckbox.id);
            });
            selectedPrice = -selectedPrice;
            control=false;
            call(selectedPrice);
           
        }
        location.reload();
    });
});

function disableOtherCheckboxes(checkedCheckbox) {
    checkboxes.forEach(otherCheckbox => {
        if (otherCheckbox !== checkedCheckbox) {
            otherCheckbox.disabled = checkedCheckbox.checked;
            if (checkedCheckbox.checked) {
                localStorage.setItem(otherCheckbox.id, 'disabled');
            } else {
                localStorage.removeItem(otherCheckbox.id);
            }
        }
    });
}
function call(selectedPrice){
	fetch('/total', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedPrice: selectedPrice }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Error sending total to the server:', error);
    });
}

var cardholderName = document.getElementById('cardholderName').value;
            var cardNumber = document.getElementById('cardNumber').value;
            var expireDay = document.getElementById('expireDay').value;
            var expireMonth = document.getElementById('expireMonth').value;
            var cvv = document.getElementById('cvv').value;
let validation;
let requestData=2;
document.getElementById("creditCardForm").addEventListener("submit", function (event) {
      
      
            if (control) {
              validation = validateCreditCardForm();
              if (validation) {
                  var newUrl = "http://localhost:3016/selected";
                  history.pushState({}, "", newUrl);
              } else {
                alert("Please choose a shipment company");
              }
            }
            else {
                alert("Please choose a shipment company");
              }
        
    
});
    


  function validateCreditCardForm() {
        

    const cardNumberInput = document.getElementById('cardNumber');
    const cvvInput = document.getElementById('cvv');

    if (!isValidCardNumber(cardNumberInput.value)) {
      alert('Please enter a valid 16-digit card number.');
      return false; 
    }

    if (!isValidCVV(cvvInput.value)) {
      alert('Please enter a valid 3-digit CVV.');
      return false; 
    }

    return true; 

}


  function isValidCardNumber(cardNumber) {
    return /^\d{16}$/.test(cardNumber);
  }

  function isValidCVV(cvv) {
    return /^\d{3}$/.test(cvv);

  }


  fetch('/check-login')
  .then(response => response.json())
  .then(data => {
      if (!data.isLoggedIn) {
          const registerForm = document.getElementById('registerForm');
          const registerButton = document.getElementById('register-btn');

          registerButton.addEventListener('click', function (event) 
          {
               event.preventDefault(); 
              registerForm.classList.toggle('active');
              loginForm.classList.remove('active');
          });
           document.getElementById('close-register-btn').addEventListener('click', function () 
          {
              registerForm.classList.remove('active');
          });


          const forgotForm=document.getElementById('forgotForm');
          const forgotButton = document.getElementById('forgotPassword-btn');

          forgotButton.addEventListener('click', function (event) 
          {
              event.preventDefault(); 
              forgotForm.classList.toggle('active');
           });
          document.getElementById('close-forgot-btn').addEventListener('click', function () 
          {
              forgotForm.classList.remove('active');
          }); 

          const adminForm=document.getElementById('adminForm');
          const adminButton = document.getElementById('admin-btn');

          adminButton.addEventListener('click', function (event) 
          {
              event.preventDefault(); 
              adminForm.classList.toggle('active');
              loginForm.classList.remove('active');
           });
          document.getElementById('close-admin-btn').addEventListener('click', function () 
          {
              adminForm.classList.remove('active');
          });


          
          
      }
  })
  .catch(error => {
      console.error('Error checking login status:', error);
});

