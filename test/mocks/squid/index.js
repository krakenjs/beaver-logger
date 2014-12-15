define([
    'angular',
    'originalSquid/class',
    'originalSquid/api',
    'originalSquid/config',
    'originalSquid/locale'
], function (angular, module) {

    return angular.module('squid', [
        'squid.class',
        'squid.api',
        'squid.config',
        'squid.locale'
    ]);
});
