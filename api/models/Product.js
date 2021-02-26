/**
* Product.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {



    idProduct: {
      type: 'INTEGER'
    },

    name: {
      type: 'STRING',
      required: true
    },
    thumbnail: {
      type: 'STRING',
    },
    photos: {
      type: 'ARRAY'
    },
    video: {
      type: 'STRING'
    },

    ean13: {
      type: 'INTEGER'
    },


    reference: {
      type: 'INTEGER'
    },

    price: {
      type: 'FLOAT',
      required: true
    },
    description: {
      type: 'STRING'
    },
    stock: {
      type: 'INTEGER',
      defaultsTo: -1 // 0 
    },
    isSelling: {
      type: 'BOOLEAN',
      defaultsTo: false
    },
    related: {
      collection: 'Product',
      via: 'related'
    },
    tags: {
      type: 'ARRAY'
    },
    provider: {
      model: 'Provider'
    },

    image: {
      type: 'ARRAY'
    },
    category: {
      model: 'Category',
      // required: true
    },


  },

  beforeValidate: function (values, callback) {
    if ( isNaN(values.stock) ) {
      values.stock = -1;
    }

    if ( values.photos ) {
      var photosValue = [];
      var photoArray = values.photos[0].split(',');

      for ( var i in photoArray )
        photosValue.push(photoArray[i].trim());

      values.photos = photosValue;
    }

    if ( values.tags ) {
      var tagsValue = [];
      var tagsArray = values.tags[0].split(',');

      for ( var j in tagsArray )
        tagsValue.push(tagsArray[j].trim().toUpperCase());

      values.tags = tagsValue;
    }

    return callback();
  },
};

