define([
    'angular',
    'originalSquid/class',
    'originalSquid/api'
], function (angular, module) {

    return angular.module('squid', [
        'squid.class',
        'squid.api'
    ]);
});
