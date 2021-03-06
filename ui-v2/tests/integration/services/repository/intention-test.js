import { moduleFor, test } from 'ember-qunit';
import repo from 'consul-ui/tests/helpers/repo';
import { get } from '@ember/object';
const NAME = 'intention';
moduleFor(`service:repository/${NAME}`, `Integration | Service | ${NAME}`, {
  integration: true,
});

const now = new Date().getTime();
const dc = 'dc-1';
const id = 'token-name';
const nspace = 'default';
test('findAllByDatacenter returns the correct data for list endpoint', function(assert) {
  get(this.subject(), 'store').serializerFor(NAME).timestamp = function() {
    return now;
  };
  return repo(
    'Intention',
    'findAllByDatacenter',
    this.subject(),
    function retrieveStub(stub) {
      return stub(`/v1/connect/intentions?dc=${dc}`, {
        CONSUL_INTENTION_COUNT: '1',
      });
    },
    function performTest(service) {
      return service.findAllByDatacenter(dc);
    },
    function performAssertion(actual, expected) {
      assert.deepEqual(
        actual[0],
        expected(function(payload) {
          const item = payload[0];
          return {
            ...item,
            CreatedAt: new Date(item.CreatedAt),
            UpdatedAt: new Date(item.UpdatedAt),
            Legacy: true,
            SyncTime: now,
            Datacenter: dc,
            // TODO: nspace isn't required here, once we've
            // refactored out our Serializer this can go
            uid: `["${nspace}","${dc}","${item.ID}"]`,
          };
        })
      );
    }
  );
});
test('findBySlug returns the correct data for item endpoint', function(assert) {
  return repo(
    'Intention',
    'findBySlug',
    this.subject(),
    function(stub) {
      return stub(`/v1/connect/intentions/${id}?dc=${dc}`);
    },
    function(service) {
      return service.findBySlug(id, dc);
    },
    function(actual, expected) {
      assert.deepEqual(
        actual,
        expected(function(payload) {
          const item = payload;
          return Object.assign({}, item, {
            Legacy: true,
            CreatedAt: new Date(item.CreatedAt),
            UpdatedAt: new Date(item.UpdatedAt),
            Datacenter: dc,
            // TODO: nspace isn't required here, once we've
            // refactored out our Serializer this can go
            uid: `["${nspace}","${dc}","${item.ID}"]`,
          });
        })
      );
    }
  );
});
