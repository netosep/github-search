$(document).ready(function() {

    var repositories = [];
    var options = {  name: null, archived: false, forked: false, orderBy: 'name asc' };

    $('#search-btn').click(function() {
        var username = $('#username').val();
        if (username != '') {
            $.ajax({
                url: `https://api.github.com/users/${username}`,
                type: 'GET',
                dataType: 'json',
                success: function(responseUser) {
                    $('#gh-img-url').attr('src', responseUser.avatar_url);
                    $('#gh-user').text(responseUser.name);
                    $('#gh-user').attr('href', responseUser.html_url);
                    $('.error').hide();
                }
            });
            $.ajax({
                url: `https://api.github.com/users/${username}/repos`,
                type: 'GET',
                dataType: 'json',
                success: function(responseRepositories) {
                    repositories = [];
                    responseRepositories.forEach((repo) => {
                        $.ajax({
                            url: `https://api.github.com/repos/${username}/${repo.name}/commits`,
                            type: 'GET',
                            dataType: 'json',
                            success: function(responseCommits) {
                                repositories.push({
                                    name: repo.name,
                                    archived: repo.archived,
                                    forked: repo.fork,
                                    lastCommitDate: new Date(responseCommits[0].commit.committer.date), // ultimo commit
                                    url: repo.html_url
                                });
                                listRepositories(repositories, options);
                            },
                            error: function(data){
                                /* repositories.push({
                                    name: repo.name,
                                    archived: repo.archived,
                                    lastCommitDate: '--/--/---',
                                });
                                listRepositories(repositories, options); */
                            }
                        });
                    });
                },
                error: function(data){
                    $('.repos ul').empty();
                    $('.user-repos-area').addClass('hidden');
                    $('.error').fadeIn(500);
                    $('.error #error-msg').text(data.responseJSON.message);
                    //alert(data.responseJSON.message);
                }
            });  
            
        }
    });

    // iniciando o app com o usuário netosep
    $('#search-btn').click();

    $('#repo-name').on('input', function() {
        options.name = $(this).val();
        listRepositories(repositories, options);
    });

    $('#archived').click(function() {
        if (options.archived) {
            options.archived = false;
            $(this).removeClass('active');
        } else {
            options.archived = true;
            $(this).addClass('active');
        }
        listRepositories(repositories, options); 
    });

    $('#forked').click(function() {
        if (options.forked) {
            options.forked = false;
            $(this).removeClass('active');
        } else {
            options.forked = true;
            $(this).addClass('active');
        }
        listRepositories(repositories, options); 
    });

    $('#order-by-name').click(function() {
        if (options.orderBy == 'name asc') {
            options.orderBy = 'name desc';
            $(this).find('i').removeClass('fa-sort-alpha-down');
            $(this).find('i').addClass('fa-sort-alpha-up');
        } else {
            options.orderBy = 'name asc';
            $(this).find('i').removeClass('fa-sort-alpha-up');
            $(this).find('i').addClass('fa-sort-alpha-down');
        }
        listRepositories(repositories, options);
    });

    $('#order-by-date').click(function() {
        if (options.orderBy == 'date asc') {
            options.orderBy = 'date desc';
            $(this).find('i').removeClass('fa-sort-numeric-down');
            $(this).find('i').addClass('fa-sort-numeric-up');
        } else {
            options.orderBy = 'date asc';
            $(this).find('i').removeClass('fa-sort-numeric-up');
            $(this).find('i').addClass('fa-sort-numeric-down');
        }
        listRepositories(repositories, options);
    });

    function listRepositories(repos, options) {
        $('.repos ul').empty();
        var reposFiltered = repos;

        if(options.name) reposFiltered = reposFiltered.filter((rep) => rep.name.toLowerCase().includes(options.name.toLowerCase()));
        if(options.archived) reposFiltered = reposFiltered.filter((rep) => rep.archived);
        if(options.forked) reposFiltered = reposFiltered.filter((rep) => rep.forked);

        switch (options.orderBy) {
            case 'name asc': 
                reposFiltered.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())); 
                break;
            case 'name desc': 
                reposFiltered.sort((a, b) => b.name.toLowerCase().localeCompare(a.name.toLowerCase())); 
                break;
            case 'date asc': 
                reposFiltered.sort((a, b) => a.lastCommitDate - b.lastCommitDate); 
                break;
            case 'date desc': 
                reposFiltered.sort((a, b) => b.lastCommitDate - a.lastCommitDate); 
                break;
        }

        $('.user-repos-area').removeClass('hidden');

        $('.repos ul').append(`
            <li>
                <span>Repository name</span>
                <span>Last commit date</span>
            </li>
        `);

        if (reposFiltered.length == 0) {
            $('.repos ul').append(`
                <li>
                    <span>No repositories found...</span>
                </li>
            `);
        }

        reposFiltered.map((rep) => {
            $('.repos ul').append(`
                <li>
                    <a href="${rep.url}" target="_blank">
                        <i class="fas fa-folder"></i>
                        <span>${rep.name}</span>
                    </a>
                    <span class="repo-date">${rep.lastCommitDate.toLocaleDateString('pt-BR')}</span>
                </li>
            `)
        });
    }
});