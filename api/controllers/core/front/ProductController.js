/**
 * ProductController
 *
 * @description :: Server-side logic for managing products
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var async = require('async');

var pathToService = '../../../services/core/';

var CoreReadDbService = require(pathToService + 'back/CoreReadDbService');
var CoreInsertDbService = require(pathToService + 'back/CoreInsertDbService');

var pathTemplateFrontCore = sails.config.globals.templatePathFrontCore;

var theme = sails.config.globals.theme;

var _ = require('underscore');


module.exports = {
    create: function (req, res) {
        Product.create(req.body, function (err, product) {
            if (err) return res.serverError(err);

            return res.redirect('/admin/product');
        });
    },

    update: function (req, res) {
        Product.update(req.params.id, req.body, function (err, product) {
            if (err) return res.serverError(err);

            return res.redirect('/admin/product');
        });
    },

    view: function (req, res) {
        var result = {
            user: (req.session.hasOwnProperty('user')) ? req.session.user : undefined
        };

        async.waterfall([
            function GetProduct(next) {
                Product.findOne(req.params.id, function (err, product) {
                    if (err) return res.serverError(err);
                    if (!product) return res.serverError('NO_PRODUCT_FOUND');

                    // URLIFY
                    product.description = Urlify(product.description);

                    result.cart = req.session.cart;
                    result.product = product;

                    return next(null, result);
                });
            }
        ], function (err, result) {
            if (err) res.serverError(err);

            return res.view(theme + 'product/single-item.ejs', result);
        });
    },

    list: function (req, res) {
        var result = {
            user: (req.session.hasOwnProperty('user')) ? req.session.user : undefined
        };

        var query = {
            isSelling: true
        }

        if (req.query.name) {
            // query.name = new RegExp('/\s?[^a-z0-9\_]'+req.query.name+'[^a-z0-9\_]/i', 'g', 'gi');
            query.name = new RegExp(req.query.name);
            query.name = req.query.name;
            console.info('productController - query.name', query.name);
            product_query = req.query.name;
        }
        else {
            product_query = ''; //default value, return all the product
        }

        async.waterfall([
            function GetProductList(next) {

                Product.find({
                    name: {
                        'contains': product_query
                    }
                }, function (err, products) {
                    if (err) next(err);

                    // check if the image is available
                    var fs = require('fs');

                    _.each(products, function (val, key) {
                        if (val) {

                            if (val && val.image && val.image[0]) {

                                products[key]['isImageAvailable'] = 0;

                                var path = val.image[0];

                                console.log('val', val);

                                var path = 'assets/images/product/' + val.idProduct + '/1.png';

                                console.log('path', path);

                                if (fs.existsSync(path)) {

                                    products[key]['isImageAvailable'] = 1;
                                }
                            }
                        }
                    });

                    console.log('new products', products);
                    result.products = products;

                    console.info('productController products', products)

                    return next(null);
                });
            },

            function getCategoryList(next) {

                var newIdProduct = CoreReadDbService.getCategoryList().then(function (categoryList) {

                    console.log('promise return value categoryList:', categoryList);
                    result.categoryList = categoryList;
                    return next(null, categoryList);
                });

            },

        ], function (err) {
            if (err) return res.serverError(err);

            if (req.session.hasOwnProperty('cart')) {
                result.cart = req.session.cart;
            }
            else {
                result.cart = [];
            }
            result.query = req.query.name;
            result.showSearchMenu = 1;


            return res.view(theme + 'index.ejs', result);
        });
    },

    status: function (req, res) {
        Product.findOne(req.params.id, function (err, product) {
            if (err) return res.serverError(err);
            if (!product) return res.send('NO_PRODUCT_FOUND');

            product.isSelling = !product.isSelling;
            product.save(function (err, product) {
                if (err) return res.send(err);

                var result = {
                    result: 'success',
                    product: product
                };

                return res.json(result);
            });
        });
    },

    // update: function (req, res) {
    //   console.log(req.body);

    //   var id = req.body.edit;
    //   delete req.body.edit;

    //   Product.update(id, req.body, function (err, product) {
    //     if (err) return res.serverError(err);

    //     return res.json(product);
    //   });
    // }

    // create: function (req, res) {
    //   async.waterfall([
    //     function UploadThumbnail (next) {
    //       req.file('thumbnail').upload(function (err, thumbnail) {
    //         if (err) next(err);

    //         next(null, thumbnail);
    //         return;
    //       });
    //     },

    //     function SetProduct (thumbnail, next) {
    //       console.log('thumbnail:', thumbnail);

    //       req.body.thumbnail = thumbnail.files.fd;

    //       Product.create(req.body, function (err, product) {
    //         if (err) next(err);

    //         next(null, product);
    //         return;
    //       });
    //     }
    //   ], function (err, result) {
    //     if (err) res.serverError();

    //     res.json(result);
    //     return;
    //   });
    // }
};

function Urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.replace(urlRegex, function (url) {
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });
};
