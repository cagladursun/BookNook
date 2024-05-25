document.addEventListener("DOMContentLoaded", function () {
    
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.querySelector('#footer-container').innerHTML = data;
        });
});

const loginForm = document.querySelector('.login-form');
document.querySelector('#login-btn').onclick = () => {
    fetch('/check-login')
        .then(response => response.json())
        .then(data => {
            if (data.isLoggedIn) {
                    window.location.href = "login_access.html";
            }
            else if(data.isLoggedInAdmin){
                window.location.href = "login_access_admin.html";
                
            }
            else {
                loginForm.classList.toggle('active');
            }
        })
        .catch(error => {
            console.error('Error checking login status:', error);
        });
};

document.addEventListener('DOMContentLoaded', function() {
document.querySelector('#logout-btn').onclick = () => {
    fetch('/logout')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = "/BookNook";
            } else {
                console.error('Logout failed:', data.message);
            }
        })
        .catch(error => {
            console.error('Error logging out:', error);
        });
};
});



document.addEventListener('DOMContentLoaded', () => {
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
    const addressLink=document.getElementById('address');
    const addressButton = document.getElementById('address-btn');
    addressButton.addEventListener('click', function (event) 
    {
        const regadd = document.querySelector('.address-form');
        const openAddressFormButton = document.getElementById('open-address-form-btn');
        const closeAddressButton = document.getElementById('close-address-btn');

         if (openAddressFormButton && closeAddressButton && regadd) {
        openAddressFormButton.addEventListener('click', () => {
            regadd.classList.toggle('active');
        });

        closeAddressButton.addEventListener('click', () => {
            regadd.classList.remove('active');
        });
         } else {
        console.error('One or more elements not found.');
        }
                    
    });
});
var outputElement = document.getElementById('output');
    var category;
    function linkClickHandler(event, linkText) {
        event.preventDefault();
        outputElement.textContent = linkText;
        category=linkText;
        fetch('http://localhost:3016/receivedCategory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ category }),
          
        })
        .then(window.location.href = '/category')
        .then(response => response.text())
        .then(responseText => console.log(responseText))
        .catch(error => console.error('Error:', error));
  
        
  }
  
      
      document.querySelectorAll('.content a').forEach(function(link) {
        link.addEventListener('click', function(event) {
          linkClickHandler(event, link.textContent);
        });
      });


      document.getElementById('close-login-btn').addEventListener('click', function () 
      {
          loginForm.classList.toggle('active');
      });



    const bookContainers = [...document.querySelectorAll('.bookcontainer')];
    const nxtBtn = [...document.querySelectorAll('.nxt-btn')];
    const preBtn = [...document.querySelectorAll('.pre-btn')];

    bookContainers.forEach((item, i) => {
    let containerWidth = 660;
    
    nxtBtn[i].addEventListener('click', () => {
        if(item.scrollLeft < 2700){
            item.scrollLeft += containerWidth + 60;
        }
        
    })

    preBtn[i].addEventListener('click', () => {
        item.scrollLeft -= (containerWidth + 60);
    })
})


if (searchBox) {

    document.getElementById("searchbutton").onclick = () => {
        var searchBoxText = searchBox.value;

        fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'searchBox=' + encodeURIComponent(searchBoxText),
        })
            .then(response => response.text())
            .catch(error => console.error('Error:', error));
    }
    searchBox.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {

            var searchBoxText = searchBox.value;

            fetch('/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'searchBox=' + encodeURIComponent(searchBoxText),
            })
                .then(response => response.text())
                .catch(error => console.error('Error:', error));
        }
    });
} else {
    alert("Search box is empty.");
}


    