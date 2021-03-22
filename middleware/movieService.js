
/*
Middleware : movieService,
Description : sending request to TMDB APIs and filtering response based on request headers .
Author :Sanjay C
Date : 18-03-2021
*/
var request = require('request');

function loadData(req,res,next){
  console.log("in middleware test function",req.headers.page);
  req.body.test="testreq";
  let movieLists;
  /* getting all movie list by getGenreListApi based on req.headers.page and stoing into resMovieList*/
  getMovieListByApi(req).then(function(resMovieList) {
    console.log("resMovieList",resMovieList);
    movieLists=resMovieList;
    /*if req.header.genre present then send request to TMDB genre list api else return empty */
    if(req.headers.genre){
      return getGenreListApi();
    }else{
      console.log("genre misssing in headers");
      return;
    }
  }).then(function(resGenrelist) { 
    /*if resGenrelist empty then then return empty else pass it to validateGenreIds to make array based on genre ids ex [16,27] */ 
    console.log("resGenrelist",resGenrelist);
    if(resGenrelist){
      return validateGenreIds(req,resGenrelist);
    }else{
      return;
    }
  }).then(function(genreIds) {  
    /*if genreids present then optimize movieList by genreids using function optimizeMoviesByGenreIDs else return variable movieLists which is original movie list*/
    console.log("genreIds",genreIds);
    if(genreIds){
      return optimizeMoviesByGenreIDs(genreIds,movieLists);
    }else{
      console.log("genreIds missing");
      return movieLists;
    }
  }).then(function(filteredByGenreData) { 
    /*if req.header.popularity present call function optimizeMoviesByPopularity which will optimize movielist by popularty else return movielist
    which is stored in variable filteredByGenreData*/
    if(req.headers.popularity){
      return optimizeMoviesByPopularity(req,filteredByGenreData);
    }else{
      console.log("popularity misssing in headers");
      movieLists=filteredByGenreData;
      return movieLists;
    } 
  }).then(function(filteredByPopularity) { 
     /*if req.header.release_date present call function optimizeMoviesByReleaseDate which will optimize movielist by release date else return movielist
    which is stored in variable filteredByPopularity*/
    if(req.headers.release_date){
      return optimizeMoviesByReleaseDate(req,filteredByPopularity);
    }else{
      console.log("Release date misssing in headers");
      movieLists=filteredByPopularity;
      return movieLists;
    }
  }).then(function(finalResponse) {  
    /*here will get final list of movies after filtering ,store it to res.body and send to router.*/
    console.log('Final response: ',finalResponse);
    res.body=finalResponse;
    next();
  }).catch(function(error) {
    console.log("error in promise chain",error);
  })
}

function optimizeMoviesByReleaseDate(req,movieListsbyReleaseDate){
  return new Promise((resolve,reject)=>{
    try{
      console.log("movieListsbyReleaseDate",movieListsbyReleaseDate);
      let tempArray=[],responseObjTemp={};
      for (var i in movieListsbyReleaseDate.results){
          if(movieListsbyReleaseDate.results[i].release_date>req.headers.release_date){
            tempArray.push(movieListsbyReleaseDate.results[i]);
          }
      }
      responseObjTemp.dates=movieListsbyReleaseDate.dates;
      responseObjTemp.page=movieListsbyReleaseDate.page;
      responseObjTemp.results=tempArray;
      resolve(responseObjTemp);
    } catch (e) {
      console.log("catch in  optimizeMoviesByReleaseDate",e);
      reject(e);
    }
})
}
function optimizeMoviesByPopularity(req,movieListsbyGenre){
  return new Promise((resolve,reject)=>{
    try{
      console.log("movieListsbyGenre",movieListsbyGenre);
      let tempArray=[],responseObjTemp={};
      for (var i in movieListsbyGenre.results){
          if(movieListsbyGenre.results[i].popularity>parseInt(req.headers.popularity)){
            tempArray.push(movieListsbyGenre.results[i]);
          }
      }
      responseObjTemp.dates=movieListsbyGenre.dates;
      responseObjTemp.page=movieListsbyGenre.page;
      responseObjTemp.results=tempArray;
      resolve(responseObjTemp);
    } catch (e) {
      console.log("catch in  optimizeMoviesByPopularity",e);
      reject(e);
    }
})
}
function optimizeMoviesByGenreIDs(genreIdsArr,resMovieListArr){
    return new Promise((resolve,reject)=>{
      try{
        console.log("resMovieListArr",resMovieListArr);
        let tempArray=[],responseObjTemp={};
        if(genreIdsArr.length===0){
          resolve(resMovieListArr);
        }else{
          for (var i in resMovieListArr.results){
            //console.log("loppp in apiResponse",resMovieListArrParse.results[i])
            if(resMovieListArr.results[i].genre_ids.some(item => genreIdsArr.includes(item))){
              tempArray.push(resMovieListArr.results[i]);
            }
          }
        }
        responseObjTemp.dates=resMovieListArr.dates;
        responseObjTemp.page=resMovieListArr.page;
        responseObjTemp.results=tempArray;
        resolve (responseObjTemp);
      } catch (e) {
        console.log("catch in  optimizeMoviesByGenreIDs",e);
        reject(e);
      }
    })
}

function validateGenreIds(req,resGenrelist){
  return new Promise((resolve,reject)=>{
    try{
      console.log("genre_ids",req.headers.genre);
      let genreIdsArray=req.headers.genre.split(',');
      let resGenrelistParse = JSON.parse(resGenrelist);
      let filterGenresIdsArr=[];
      for (var i in resGenrelistParse.genres){
        if(genreIdsArray.includes(resGenrelistParse.genres[i].name)){
          filterGenresIdsArr.push(resGenrelistParse.genres[i].id);
        }
      }
      console.log("after filtering genre ids are",filterGenresIdsArr);
      resolve(filterGenresIdsArr);
    } catch (e) {
      console.log("catch in  validateGenreIds",e);
      reject(e);
      }

  })
}

function getMovieListByApi(req){
  console.log("in middleware movie service ");
  let page=req.headers.page?req.headers.page:1;
  return new Promise((resolve,reject)=>{
    try{
    var options = {
      'method': 'GET',
      'url': 'https://api.themoviedb.org/3/movie/now_playing?api_key=2c0ee212521f920a35cb487ebe07ac91&language=en-US&page='+page,
      'headers': {
      }
    };
    request(options, function (error, response) {
      if (error){
        console.log("error in getMovieList",error);
        reject(error);
      }
      response?resolve(JSON.parse(response.body)):reject("Response has issue getMovieList");
    });
    } catch (e) {
      console.log("catch in  getMovieList",e);
      reject(e);
    }
})
}

function getGenreListApi(){
  return new Promise((resolve,reject)=>{
    try{
    var options = {
      'method': 'GET',
      'url': 'https://api.themoviedb.org/3/genre/movie/list?api_key=2c0ee212521f920a35cb487ebe07ac91&language=en-US',
      'headers': {
      }
    };
    request(options, function (error, response) {
      if (error){
        console.log("error in getGenreList",error);
        reject(error);
      }
      response?resolve(response.body):reject("Response has issue getGenreList");
      });
  } catch (e) {
      console.log("catch in  getGenreList",e);
      reject(e);
    }
  })
}

module.exports=loadData;