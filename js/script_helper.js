var headernextencoded;
var _lists = 'lists';
var listId, autoDownload, showAlert;
var listName, nextTimer;
var linkToken;
//Helper start
function DecodeEncodedNonAsciiCharacters(x) {
    var r = /\\u([\d\w]{4})/gi;
    x = x.replace(r, function (match, grp) {
        return String.fromCharCode(parseInt(grp, 16));
    });
    x = unescape(x);
    return x;
}

function SubString(_para) {
    var _return = '';
    var startindex = _para.invl.indexOf(_para.startvl);
    if (startindex > -1) {
        startindex += _para.addstartindex;
        var endindex = -1;
        if (_para.endvl.length > 0 && (endindex = _para.invl.indexOf(_para.endvl, startindex)) > startindex) {
            endindex += _para.addendindex;
            _return = _para.invl.substring(startindex, endindex);
        }
        else {
            _return = _para.invl.substring(startindex);
        }
    } return _return;
}
function SubstringFooterNext(htmlreload) {
    return SubString({ invl: htmlreload, startvl: '"cursor":', addstartindex: 0, endvl: '}', addendindex: 1 });
}
function SubstringHeaderNext(htmlreload) {
    return SubString({ invl: htmlreload, startvl: '{"view":"list"', addstartindex: 0, endvl: 'story_id":', addendindex: 0 }) + 'story_id":null';
}
function cutNextUrl(htmlreload) {
    var footernext = SubstringFooterNext(htmlreload);
    var jsonPost = headernextencoded + ',' + footernext;
    jsonPost = decodeURIComponent(jsonPost);
    jsonPost = encodeURIComponent(jsonPost);
    return footernext && 'https://www.facebook.com/ajax/pagelet/generic.php/BrowseScrollingSetPagelet?data=' + jsonPost + '&__a';

}
function getData(link, onSuccess, onError) {
    myhttp.Getajax({
        url: link,
        type: 'html',
        success: function (d) {
            onSuccess(d);
        }, error: function (d) {
            onError(link);
        }
    })
}
function SaveToLocalMobile(_lstResult, _listId) {


    $('body').find('[download]').remove();
    const MIME_TYPE = 'text/plain;charset=UTF-8';
    var savedata = '"UID","Name","Email @facebook"\n';
    for (var i = 0; i < _lstResult.length; i++) {
        savedata += '"' + _lstResult[i].join('","') + '"\n';
    }
    var bb = new Blob([savedata], { type: MIME_TYPE });
    var link = document.createElement("a");
    link.textContent = "Save as csv";
    link.download = "FB_UID_Scraper_Small" + _listId + '.csv';
    link.href = window.URL.createObjectURL(bb);

    //window.open(link); //debug only

    document.body.appendChild(link);

    if ($('body').find('[download]').length != 0) {
        link.click();
    }


}
function SaveToLocal(_lstResult, _listId) {


    $('body').find('[download]').remove();
    const MIME_TYPE = 'text/plain;charset=UTF-8';
    var savedata = '"UID","Name","Sex","Email @facebook","Location","Job","Company","Work","Education"\n';
    for (var i = 0; i < _lstResult.length; i++) {
        savedata += '"' + _lstResult[i].join('","') + '"\n';
    }
    var bb = new Blob([savedata], { type: MIME_TYPE });
    var link = document.createElement("a");
    link.textContent = "Save as csv";
    link.download = "FB_UID_Scraper_" + _listId + '.csv';
    link.href = window.URL.createObjectURL(bb);

    //window.open(link); //debug only

    document.body.appendChild(link);

    if ($('body').find('[download]').length != 0) {
        link.click();
    }


}
//Helper end
function completed() {
    if (autoDownload) {
        chrome.storage.local.get(listId, function (data) {

            SaveToLocalMobile(data[listId], listName);
            //            SaveToLocal(data[listId], listName);
            showAlert || alert('Scrape and Save completed');
        });
    } else {
        showAlert || alert('Scrape completed. Please click download list');

    }
}
function showNext_callback(htmlnext) {
    var htmldoc = SubString({ invl: htmlnext, startvl: 'payload":"', addstartindex: 'payload":"'.length, endvl: 'jsmods', addendindex: -3 });

    if (htmldoc.length > 0) {

        var htmldecoded = DecodeEncodedNonAsciiCharacters(htmldoc).replace(/\\\"/g, "'").replace(/\\/g, '');
        //console.log("f1=" + htmldecoded.indexOf('\\\"'));
        //console.log("f2=" + htmldecoded.indexOf('\"'));
        //console.log("f3=" + htmldecoded.indexOf('\\'));
        //console.log(htmldecoded);
        selectData(htmldecoded);
        footernext = SubstringFooterNext(htmlnext);
        if (footernext.length <= 0) {
            completed();
            return;
        }
    }
    else {
        alert("error. Can not load more uid");
        return;
    }
    var urlNextPage = cutNextUrl(htmlnext);
    if (urlNextPage) {
        if (nextTimer) {
            clearTimeout(nextTimer);
        }
        nextTimer = setTimeout(function () {
            getData(urlNextPage, showNext_callback, function (_link) {//onError function
                getData(_link, showNext_callback, function () {
                    completed();
                });
            });
        }, 1000);
    } else {
        completed();
    }


}
function selectData(_html) {
    var nodelist = $(_html).find("div[data-bt^='{\"id\":']>div>div>a ");//.//button[@data-profileid and @type='button']");////div[contains(@data-bt,'id')]
    if (nodelist.length > 0) {
        var uid, name, sex, profile_url, current_location_name, job = '', company, Work, Education;
        var currList;
        var _lists = 'lists';
        var lcount = 0;
        //----
        chrome.storage.local.get(listId, function (data) {
            var currList = data[listId] || [];

            $(nodelist).each(function () {
                var item = $(this).next();
                profile_url = $(this).attr('href');
                if (profile_url) {
                    var uname = /\.com\/(.+)\?ref/.exec(profile_url);
                    if (uname) {
                        profile_url = uname[1] + '@facebook.com';
                    } else {
                        uname = /\?id=(.+)\&ref/.exec(profile_url);
                        if (uname) {
                            profile_url = uname[1] + '@facebook.com';
                        }
                    }
                }
                name = item.find("div[data-bt='{\"ct\":\"title\"}'] a").text();
                if (!name) {
                    name = item.find("a div.clearfix>div").text();
                }
                uid = item.find("button[data-profileid]").attr('data-profileid');
                if (!uid) {
                    var suid = $(this).parent().parent().attr('data-bt');
                    uid = SubString({ invl: suid, startvl: '{"id":', addstartindex: '{"id":'.length, endvl: ',', addendindex: 0 });
                }
                company = item.find("div[data-bt*=sub_headers]>a:nth-child(2)").text();
                if (company) {
                    job = item.find("div[data-bt*=sub_headers]>a:nth-child(1)").text();
                } else {
                    company = item.find("div[data-bt*=sub_headers]>a:nth-child(1)").text();
                }

                var snippets = item.find("div._glo>div");
                if (snippets.length > 0) {
                    Work = company;
                    Education = company;
                    current_location_name = company;
                    //sp_chyc96 sx_7e4b5d
                    var Live = snippets.find("div._52eh:contains('Lives in')");//[contains(@class,'sp_1cnqys sx_aa8b9d')]
                    //Lives in
                    if (Live.length > 0) {
                        current_location_name = Live.children().text();
                    }
                    var work = snippets.find("div._52eh:contains('at')");//[contains(@class,'sp_1cnqys sx_4d6514')]
                    //Works at
                    if (work.length > 0) {
                        if (work.text().indexOf('Stud') < 0) {
                            Work = work.children().text();
                        }
                    }
                    var edu = snippets.find("div._52eh:contains('Stud')");//[contains(@class,'sp_1cnqys sx_6dc55d')]
                    //Studied at 
                    if (edu.length > 0) {
                        Education = edu.children().text();
                    }

                    sex = "Male";

                    var st = snippets.find("div:contains('Female')");//[contains(@class,'sp_1cnqys sx_5cba21')]
                    if (st.length > 0) {
                        sex = "Female";
                    }
                }
                lcount = currList.length;
                currList[lcount] = [uid, name, sex, profile_url, current_location_name, job, company, Work, Education];
                lcount++;
            });
            //------
            var objsave = {};
            objsave[listId] = currList;
            chrome.storage.local.set(objsave, function () {
                Log('items (' + lcount + ')');
            });
        });


    }
}
function selectDataMobile(_html) {
    var nodelist = $(_html).find(".ib>i[aria-label]");//.//button[@data-profileid and @type='button']");////div[contains(@data-bt,'id')]
    if (nodelist.length > 0) {
        var uid, name, email;
        var currList;
        var _lists = 'lists';
        var lcount = 0;
        //----
        chrome.storage.local.get(listId, function (data) {
            var currList = data[listId] || [];
            $(nodelist).each(function () {
                var item = $(this).parent().parent().find("a[data-store*='result_id']");
                uid = /result_id\":(.+),/.exec(item.attr('data-store')) || 'empty';
                if (uid != 'empty') {
                    uid = uid[1];
                } else {
                    console.log("Mobile  uid not found");
                }
                email = item.attr('href');
                if (email.indexOf("/profile.php") == 0) {
                    email = uid + "@facebook.com";
                } else {
                    email = /\/(.+)\?/.exec(item.attr('href')) || 'empty';
                    if (email != 'empty') {
                        email = email[1] + "@facebook.com";
                    } else {
                        email = uid + "@facebook.com";
                    }
                }

                name = $(this).attr('aria-label');
                lcount = currList.length;
                currList[lcount] = [uid, name, email];
                lcount++;
            });
    
            //------
            var objsave = {};
            objsave[listId] = currList;
            chrome.storage.local.set(objsave, function () {
                Log('items (' + lcount + ')');
            });
        });


    }
}
function Log(txt) {
    $('#labelScrape').text(txt);
    $('#btnScrape').hide();
    $('#labelScrape').show();
}
function RunScarapingDetail(currHtml, currLink) {
    selectData(currHtml);//select current page
    //showNext_callback(fullHtml);
    //-----------Begin Facebook---------------------
    getData(currLink, function (htmlreload) {
        headernextencoded = SubstringHeaderNext(htmlreload).replace(/\\\//g, '/');;
        var urlNextPage = cutNextUrl(htmlreload);
        if (urlNextPage) {
            getData(urlNextPage, showNext_callback, function () {
                completed();
            });
        } else {
            completed();
        }
    }, function () {
            Log("load data error");
        });
}
function RunScrapingPC(currHtml, currLink, lid, lname, autodownload, showalert) {
    autoDownload = autodownload;
    showAlert = showalert;
    listId = lid;
    listName = lname;
    if (listName) {//list moi


        chrome.storage.local.get(_lists, function (data) {
            var currList = data[_lists] || {};
            currList[listId] = listName;
            var objsave = {};
            objsave[_lists] = currList;
            chrome.storage.local.set(objsave, function () {
                RunScarapingDetail(currHtml, currLink);
            });
        });
    } else//list cu
    {
        RunScarapingDetail(currHtml, currLink);
    }


}
//Mobile code
function next_callback_Mobile(htmlreload) {
    linkToken = /token\":\"(.+)\",\"valid/.exec(htmlreload);
    if (linkToken && linkToken.length > 1) {
        linkToken = linkToken[1];
    } else {
        console.log('null token');
        linkToken = "";
    }
    //completed();//test completed now
    var urlNextPage = /see_more_pager\",\"href\":\"(.+)\&usid/.exec(htmlreload);
    if (urlNextPage && urlNextPage.length > 0) {
        if (nextTimer) {
            clearTimeout(nextTimer);
        }
        var nextUrl=urlNextPage[1].replace(/\\\//g, '/');
        nextUrl=nextUrl.replace(/\\u002520/g,"%20");
//        nextUrl=nextUrl.replace(/\\/g,"");
        nextTimer = setTimeout(function () {
            $.ajax({
                url: nextUrl,
                dataType: 'text'
            }).done(next_callback_Mobile)
                .error(function () {
                Log("load data error");
                completed();
            });
        }, 500);
    } else {
        completed();
    }
    selectDataMobile($(htmlreload).find('#root').html());//select current page
    
}
function RunScarapingDetailMobile(currLink) {

    
    //showNext_callback(fullHtml);
    //-----------Begin Facebook---------------------
    $.ajax({
        url: currLink,
        dataType: 'text'
    }).done(next_callback_Mobile)
        .error(function () {
        Log("load data error");
    });
}
function RunScraping(currHtml, currLink, lid, lname, autodownload, showalert) {

    autoDownload = autodownload;
    linkArray = currLink.split('/')[4];
    var linkMobileGraph = currLink.replace("https://www.facebook.com/search/", "https://m.facebook.com/graphsearch/");
//    linkMobileGraph=linkMobileGraph
    openAlert = showalert;
    listId = lid;
    listName = lname;
    if (listName) {//list moi


        chrome.storage.local.get("lists", function (data) {
            var currList = data[_lists] || {};
            currList[listId] = listName;
            var objsave = {};
            objsave[_lists] = currList;
            chrome.storage.local.set(objsave, function () {
                RunScarapingDetailMobile(linkMobileGraph);
            });
        });
    } else//list cu
    {
        RunScarapingDetailMobile(linkMobileGraph);
    }

}