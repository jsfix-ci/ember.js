/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable prefer-const */
import Route from '@ember/routing/route';
import type Array from '@ember/array';
import EmberObject from '@ember/object';
import Controller from '@ember/controller';
import type Transition from '@ember/routing/transition';
import { expectTypeOf } from 'expect-type';

class Post extends EmberObject {}

interface Posts extends Array<Post> {}

class BeforeModelText extends Route {
  beforeModel(transition: Transition) {
    this.transitionTo('someOtherRoute');
  }
}

class AfterModel extends Route {
  afterModel(posts: Posts, transition: Transition) {
    if (posts.firstObject) {
      this.transitionTo('post.show', posts.firstObject);
    }
  }
}

class ModelTest extends Route {
  model() {
    return this.modelFor('post');
  }
}

class QPsTest extends Route {
  queryParams = {
    memberQp: { refreshModel: true },
  };
}

class ResetControllerTest extends Route {
  resetController(controller: Controller, isExiting: boolean, transition: Transition) {
    if (isExiting) {
      //   controller.set('page', 1);
      transition.abort();
    }
  }
}

class ActivateRoute extends Route {
  activate(transition: Transition) {
    this.transitionTo('someOtherRoute');
  }
}

class DeactivateRoute extends Route {
  deactivate(transition: Transition) {
    this.transitionTo('someOtherRoute');
  }
}

class RedirectRoute extends Route {
  redirect(model: {}, a: Transition) {
    if (!model) {
      this.transitionTo('there');
    }
  }
}

class InvalidRedirect extends Route {
  // @ts-expect-error
  redirect(model: {}, a: Transition, anOddArg: unknown) {
    if (!model) {
      this.transitionTo('there');
    }
  }
}

class TransitionToExamples extends Route {
  // NOTE: this one won't check that `queryParams` has the right shape,
  // because the overload for the version where `models` are passed
  // necessarily includes all objects.
  transitionToModelAndQP() {
    expectTypeOf(
      this.transitionTo('somewhere', { queryParams: { neat: true } })
    ).toEqualTypeOf<Transition>();
  }

  transitionToJustQP() {
    expectTypeOf(this.transitionTo({ queryParams: { neat: 'true' } })).toEqualTypeOf<Transition>();
  }

  transitionToNonsense() {
    // @ts-expect-error
    this.transitionTo({ cannotDoModelHere: true });
  }

  transitionToBadQP() {
    // @ts-expect-error
    this.transitionTo({ queryParams: 12 });
  }

  transitionToId() {
    expectTypeOf(this.transitionTo('blog-post', 1)).toEqualTypeOf<Transition<unknown>>();
  }

  transitionToIdWithQP() {
    expectTypeOf(
      this.transitionTo('blog-post', 1, { queryParams: { includeComments: true } })
    ).toEqualTypeOf<Transition<unknown>>();
  }

  transitionToIds() {
    expectTypeOf(this.transitionTo('blog-comment', 1, '13')).toEqualTypeOf<Transition<unknown>>();
  }

  transitionToIdsWithQP() {
    expectTypeOf(
      this.transitionTo('blog-comment', 1, '13', { queryParams: { includePost: true } })
    ).toEqualTypeOf<Transition<unknown>>();
  }

  buildRouteInfoMetadata() {
    return { foo: 'bar' };
  }
}

class ApplicationController extends Controller {}
declare module '@ember/controller' {
  interface Registry {
    application: ApplicationController;
  }
}

class SetupControllerTest extends Route {
  setupController(controller: Controller, model: {}, transition: Transition) {
    this._super(controller, model);
    this.controllerFor('application').set('model', model);
    transition.abort();
  }
}

const route = Route.create();
expectTypeOf(route.controllerFor('whatever')).toEqualTypeOf<Controller>();
expectTypeOf(route.paramsFor('whatever')).toEqualTypeOf<object>();

class RouteUsingClass extends Route.extend({
  randomProperty: 'the .extend + extends bit type-checks properly',
}) {
  beforeModel() {
    return Promise.resolve('beforeModel can return promises');
  }
  afterModel(resolvedModel: unknown, transition: Transition) {
    return Promise.resolve('afterModel can also return promises');
  }
  intermediateTransitionWithoutModel() {
    this.intermediateTransitionTo('some-route');
  }
  intermediateTransitionWithModel() {
    this.intermediateTransitionTo('some.other.route', {});
  }
  intermediateTransitionWithMultiModel() {
    this.intermediateTransitionTo('some.other.route', 1, 2, {});
  }
}

class WithNonReturningBeforeAndModelHooks extends Route {
  beforeModel(transition: Transition): void | Promise<unknown> {
    return;
  }

  afterModel(resolvedModel: unknown, transition: Transition): void {
    return;
  }
}

class WithBadReturningBeforeAndModelHooks extends Route {
  beforeModel(transition: Transition): void | Promise<unknown> {
    // @ts-expect-error
    return "returning anything else is nonsensical (if 'legal')";
  }

  afterModel(resolvedModel: unknown, transition: Transition): void {
    // @ts-expect-error
    return "returning anything else is nonsensical (if 'legal')";
  }
}

interface RouteParams {
  cool: string;
}

class WithParamsInModel extends Route<boolean, RouteParams> {
  model(params: RouteParams, transition: Transition) {
    return true;
  }
}

// @ts-expect-error
class WithNonsenseParams extends Route<boolean, number> {}

class WithImplicitParams extends Route {
  model(params: RouteParams) {
    return { whatUp: 'dog' };
  }
}

type ImplicitParams = WithImplicitParams extends Route<any, infer T> ? T : never;
expectTypeOf<ImplicitParams>().toEqualTypeOf<RouteParams>();
