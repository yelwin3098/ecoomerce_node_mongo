/**
 * Admin/productController
 *
 * @description :: Server-side logic for managing admin/products
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird');

var async = require('async');

var pathToService = '../../../services/core/';

var CoreReadDbService = require(pathToService + 'back/CoreReadDbService');
var CoreInsertDbService = require(pathToService + 'back/CoreInsertDbService');
var CoreDeleteDbService = require(pathToService + 'back/CoreDeleteDbService');

var pathTemplateBackCore =  sails.config.globals.templatePathBackCore;

//module.exports = CoreReadDbService;


module.exports = {

    /**
     * `Admin/productController.new()`
     */
    create: function (req, res) {
        var result = {};

        async.waterfall([

            function getNewIdProducT (next) {

                CoreReadDbService.getNewIdProduct().then(function(idProduct){

                    console.log('promise return value:', idProduct);

                    result.idProduct = idProduct;

                    CoreReadDbService.getCategoryList().then(function(categoryList){

                        console.log('ProductController - categoryList', categoryList);

                        result.categoryOption = categoryList;
                        result.templateToInclude = 'product';
                        result.pathToInclude = '../product/create';

                        return res.view(pathTemplateBackCore + 'commun-back/main.ejs', result);

                    })

                    return next(null, idProduct);
                });
            }

        ]);
    },

    preview: function (req, res) {
        var result = {
            user: (req.session.hasOwnProperty('user')) ? req.session.user : undefined
        };

        async.waterfall([
            function GetProduct(next) {
                Product.findOne(req.params.id, function (err, product) {
                    if (err) return res.serverError(err);
                    if (!product) return res.serverError('NO_PRODUCT_FOUND');
                    // URLIFY
                    //product.description = Urlify(product.description);
                    result.cart = req.session.cart;
                    result.product = product;
                    return next(null, result);
                });
            }
        ], function (err, result) {
            if (err) {res.serverError(err);}
            else {

                result.templateToInclude = 'product_preview';
                result.pathToInclude = '../product/preview.ejs';

                return res.view(pathTemplateBackCore + 'commun-back/main.ejs', result);

            }
        });
    },

    list: function (req, res) {
        var result = {
            admin: req.session.user
        };
        var skip = 0;
        var page = 1;

        if (req.query.hasOwnProperty('page')) {
            skip = (req.query.page - 1) * 10;
            page = req.query.page;
        }

        var queryOptions = {
            where: {},
            skip: skip,
            limit: 20,
            sort: 'createdAt DESC'
        };

        result.page = page;

        async.waterfall([
            function GetTotalCount(next) {
                Product.count(function (err, num) {
                    if (err) return next(err);

                    result.pages = [];

                    for (var i = 0, count = parseInt(num / queryOptions.limit); i <= count; i++) {
                        result.pages.push(i + 1);
                    }

                    return next(null);
                });
            },

            function GetProducts(next) {
                Product.find(queryOptions, function (err, products) {
                    if (err) next(err);

                    result.products = products;

                    return next(null);
                });
            },

            function GetEditProduct(next) {
                if (!req.params.hasOwnProperty('id')) {
                    return next(null);
                    return;
                }

                Product.findOne(req.params.id, function (err, product) {
                    if (err) next(err);
                    result.edit = product;

                    return next(null);
                });
            }
        ], function (err) {
            if (err) return res.serverError(err);
            result.templateToInclude = 'product_list';
            result.pathToInclude = '../product/list.ejs';
            return res.view(pathTemplateBackCore + 'commun-back/main.ejs', result);
        });
    },

    edit: function (req, res, id) {

        var result = {};
        // we take the id of the product and get all the product details to set the template
        //     console.info('modification product - req: ', req);
        console.info('modification product id: ', req.params.id);
        console.info(req.params.id.length);

        if (req.params.id && (req.params.id.length > 0 )) {
            // we retrieve the product informations
            var productId = req.params.id;
            var queryOptions = {
                where: {id: productId},
                limit: 10,
                sort: 'createdAt DESC'
            };

            Product.find(queryOptions, function (err, products) {
                if (err) next(err);

                result.product = {};
                result.product = products[0];

                if (products[0].idProduct){
                result.idProduct = products[0].idProduct;
                }
                else
                {
                    result.idProduct = 0;
                }

                CoreReadDbService.getCategoryList().then(function(categoryList){

                    console.log('ProductController - categoryList', categoryList);

                    result.categoryOption = categoryList;

                    console.info('edit query result', products);
                    console.info('edit - result', result);
                    result.templateToInclude = 'product_edit';
                    result.pathToInclude  = '../product/edit.ejs';
                    return res.view(pathTemplateBackCore + 'commun-back/main.ejs', result);
                })

            });

        }
        else {
            result.templateToInclude = 'productModification';
            return res.view(pathTemplateBackCore + 'commun-back/main.ejs', result);
        }
    },

    deleteConfirmation: function (req, res, id) {

        var result = {};
        console.info('modification product id: ', req.params.id);
        console.info(req.params.id.length);

        if (req.params.id && (req.params.id.length > 0 )) {
            // we retrieve the product informations
            var productId = req.params.id;


            CoreDeleteDbService.deleteProduct(productId);

            result.templateToInclude = 'product_delete_ok';
            result.pathToInclude = '../product/delete-ok.ejs';
            return res.view(pathTemplateBackCore + 'commun-back/main.ejs', result);



        }
        else {
            result.templateToInclude = 'product_list';
            return res.view(pathTemplateBackCore + 'commun-back/main.ejs', result);
        }
    },



    delete: function (req, res, id) {  // display the delete page for validation

        var result = {};

        //console.info('modification product id: ', req.params.id);
        //console.info(req.params.id.length);

        if (req.params.id && (req.params.id.length > 0 )) {
            // we retrieve the product informations
            var productId = req.params.id;


            result.templateToInclude = 'product_delete';
            result.pathToInclude = '../product/delete.ejs';
            result.idProduct = productId;

            return res.view(pathTemplateBackCore + 'commun-back/main.ejs', result);
        }
    },


    editValidation: function (req, res) {

        console.info('req');
        console.info(req.body);

        if (req && req.body && req.body.name) {
            var data = {};

            data = req.body;

            CoreInsertDbService.updateProduct(data);

            //CoreInsertDbService.incrementId('product');

            var result = {};

            result.templateToInclude = 'product_edit_ok';
            result.pathToInclude = '../product/edit-ok.ejs';

            return res.view(pathTemplateBackCore + 'commun-back/main.ejs', result);

            console.log('productController - productNewValidation - req.body',data );

        }
        else {
            //var result = {};
            //result.templateToInclude = 'product_edit_ok';
            //return res.view(pathTemplateBackCore + 'commun-back/main.ejs', result);
        }
    },


    productNewValidation: function (req, res) {

        console.info('req');
        console.info(req.body);

        if (req && req.body && req.body.name) {
            var data = {};

            data = req.body;

            CoreInsertDbService.insertProduct(data);

            CoreInsertDbService.incrementId('product');

            var result = {};

            result.templateToInclude = 'productCreationOk';
            result.pathToInclude = '../product/creationOk.ejs';

            return res.view(pathTemplateBackCore + 'commun-back/main.ejs', result);

            console.log('productController - productNewValidation - req.body',data );

           /* Product.create(data, function (err, product) {
                if (err) {
                    return res.serverError(err);
                }
                else {

                    // once created we increment the id produit in counter table
                    //return res.ok('create of the product done', req.body);
                }
                //return res.redirect('/admin/product');
            });*/
        }
        else {
            var result = {};
            result.templateToInclude = 'productCreationKo';
            result.pathToInclude = '../product/creationKo.ejs';
            return res.view(pathTemplateBackCore + 'commun-back/main.ejs', result);
            //return res.ok('missing one parameter');
        }
    },

    previewold: function (req, res) {

        console.log ('[start]: productController - preview ');

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
            if (err) {res.serverError(err);}
            else{

            return res.view(pathTemplateBackCore + 'product/preview.ejs', result);
            }
        });
    },



};

function Urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.replace(urlRegex, function (url) {
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });
};

