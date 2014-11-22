define([
    'angular',
    'originalSquid/class',
    'originalSquid/api',
    'originalSquid/config'
], function (angular, module) {

    return angular.module('squid', [
        'squid.class',
        'squid.api',
        'squid.config'
    ]);
});
