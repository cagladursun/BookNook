
$(document).ready(function(){ //when book Page opened

    $('#add_review').click(function(){//make an review button clicked

        $('#review_modal').modal('show');

    });

    $('#save_review').click(function(){//rating and username is entered
        
        var ele = document.getElementsByName('star');//get the rating data
        var rating = 0;
        for (i = 0; i < ele.length; i++) {
            if (ele[i].checked){
                rating = ele.length-i;
            }
        }

        // Assuming you have user_name and user_comment values available
        var user_name = $('#user_name_input').val();
        var user_comment = $('#user_comment_input').val();

        fetch('/check-star', {//Sen the star data to node.js
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_name, user_comment, rating }),
        })
        .then(response => response.json())
        .then(data => {
            fetch('/review', {//Add the new review to book_rating table
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            })
            window.location.href = "/my_ratings";
        })
        .catch(error => {
            console.error('Error checking star review:', error);
        })
    });

    
    const promise = new Promise(function(resolve, reject) {
    setTimeout(async function() {
        const response = (await fetch('/bookrating').then((val) => val.text()));//get the book_rating 
        resolve(response);
    }, 100);
    });

    promise.then(function(result) {
        
        $.ajax({
            url: 'http://localhost:3016/bookrating',
            method: 'GET',
            data: { action: 'load_data' },
            dataType: 'JSON',
            success: function (data) {//create a html to send to book PAge to show comments and ratings
                $('#average_rating').text(data[0].toFixed(2));
                $('#total_review').text(data[1]);

                var count_star = 0;

                $('.main_star').each(function(){
                    count_star++;
                    if(Math.ceil(data[0]) >= count_star)
                    {
                        $(this).addClass('text-warning');
                        $(this).addClass('star-light');
                    }
                });

                $('#total_five_star_review').text(data[2]);

                $('#total_four_star_review').text(data[3]);

                $('#total_three_star_review').text(data[4]);

                $('#total_two_star_review').text(data[5]);

                $('#total_one_star_review').text(data[6]);

                $('#five_star_progress').css('width', (data[2]/data[1]) * 100 + '%');

                $('#four_star_progress').css('width', (data[3]/data[1]) * 100 + '%');

                $('#three_star_progress').css('width', (data[4]/data[1]) * 100 + '%');

                $('#two_star_progress').css('width', (data[5]/data[1]) * 100 + '%');

                $('#one_star_progress').css('width', (data[6]/data[1]) * 100 + '%');

                if(data[7].length > 0){
                    var html = '';

                    for(var count = 0; count < data[7].length; count++){
                        html += '<div class="row mb-3">';
                        html += '<div class="col-sm-1"><div class="rounded-circle bg-danger text-black pt-2 pb-2"><h3 class="text-center">'+data[7][count].charAt(0)+'</h3></div></div>';
                        
                        html += '<div class="col-sm-11">';

                        html += '<div class="card">';

                        html += '<div class="card-header"><b>'+data[7][count]+'</b></div>';

                        html += '<div class="card-body">';

                        for(var star = 1; star <= 5; star++)
                        {
                            var class_name = '';

                            if(data[8][count]>= star)
                            {
                                class_name = 'text-warning';
                            }
                            else
                            {
                                class_name = 'star-light';
                            }

                            html += '<i class="fas fa-star '+ class_name+' mr-1"></i>';
                        }

                        html += '<br />';

                        html += data[9][count];

                        html += '</div>';

                        html += '<div class="card-footer text-right">On '+ " " +'</div>';

                        html += '</div>';

                        html += '</div>';

                        html += '</div>';
                    }
                    $('#review_content').html(html);
                }

            },
            error: function () {
                console.error('Error loading data from the server');
            }
        });
    });
     
});