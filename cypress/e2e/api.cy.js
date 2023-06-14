import post from '../fixtures/post.json'
import { faker } from '@faker-js/faker';
import user from '../fixtures/user.json'

post.body = faker.internet.domainWord();
post.title = faker.person.fullName();
post.userId = faker.number.int();
post.id = faker.number.int();

user.email = faker.internet.email();
user.password = faker.internet.password();


describe('Api tests with json-server', () => {

  let token;

  it('Registration', () => {
    cy.request({
      method: 'POST',
      url: '/register',
      body:
      {
        "email": user.email,
        "password": user.password
      },
    }).then(response => {
      token = 'Bearer ' + response.body.accessToken
      expect(response.status).to.be.eq(201);
      console.log(token)
    })
  })

  it('1 - Get all post', () => {

    cy.request({
      method: 'GET',
      url: '/posts',
    }).then(response => {
      expect(response.status).to.be.equal(200);
      expect(response.headers).to.have.property('content-type').include('application/json')
    })
  })

  it('2 - Get only first 10 posts', () => {

    cy.request({
      method: 'GET',
      url: '/posts?_page=1&_limit=10',
    }).then(response => {
      expect(response.status).to.be.equal(200);
      expect(response.body).to.have.length(10);
      expect(response.body[0].userId).to.be.equal(1);
      expect(response.body[0].id).to.be.equal(1);
    })
  })

  it('3 - Get posts with id = 55 and id = 60', () => {

    cy.request({
      method: 'GET',
      url: '/posts?id=55&id=60',
    }).then(response => {
      expect(response.status).to.be.equal(200);
      expect(response.body[0].id).to.be.equal(55);
      expect(response.body[1].id).to.be.equal(60);
    })
  })


  it('4 - Create a post', () => {

    cy.request({
      method: 'POST',
      url: '/664/posts',
      body: post,
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.be.equal(401);
      expect(response.body).to.be.equal('Missing authorization header')
    })
  })


  it('5 - Create post with adding access token in header', () => {

    cy.request({
      headers:
      {
        'Authorization': token
      },
      method: 'POST',
      url: '/664/posts',
      body:
      {
        title: post.title,
        body: post.body
      }
    }).then(response => {
      expect(response.status).to.be.eq(201);
      expect(response.body.title).to.be.eq(post.title);
      expect(response.body.body).to.be.eq(post.body);
      post.id = response.body.id;
    }).then(() => {
      cy.request({
        headers:
        {
          'Content-Type': 'application/json'
        },
        method: 'GET',
        url: `/664/posts/${post.id}`
      }).then(response => {
        expect(response.status).to.be.eq(200);
        expect(response.body.title).to.be.eq(post.title);
        expect(response.body.body).to.be.eq(post.body);
      })
    })
  })


  it('6 - Create post entity and verify that the entity is created', () => {

    post.id = '12345'
    post.body = 'json-server56';
    post.title = 'typicode56'

    cy.request({
      method: 'POST',
      url: '/posts',
      body: post
    }).then(response => {
      expect(response.status).to.be.equal(201);
      expect(response.body.id).to.be.equal(post.id);
      expect(response.body.title).to.be.equal(post.title);
      expect(response.body.body).to.be.equal(post.body);
    }).then(() => {
      cy.request({
        method: 'GET',
        url: `/posts/${post.id}`,
      }).then(response => {
        expect(response.status).to.be.equal(200);
        expect(response.body.id).to.be.equal(post.id);
        expect(response.body.title).to.be.equal(post.title);
        expect(response.body.body).to.be.equal(post.body);
      })
    })
  })


  it('7 - Update non-existing entity', () => {
    post.title = 'qwe'
    cy.request({
      method: 'PUT',
      url: '/posts/333',
      failOnStatusCode: false,
      body: post
    }).then(response => {
      expect(response.status).to.be.equal(404);
    })
  })


  it('8 - Create post entity and update the created entity', () => {

    post.id = '1234587'

    cy.request({
      method: 'POST',
      url: '/posts',
      body: post
    }).then(response => {
      expect(response.status).to.be.equal(201);
      expect(response.body.id).to.be.equal(post.id);
      expect(response.body.userId).to.be.equal(post.userId);
      expect(response.body.title).to.be.equal(post.title);
      expect(response.body.body).to.be.equal(post.body);
    }).then(() => {
      post.userId = '56565';
      post.body = 'ill-fated-textual';
      post.title = 'Greenfelder'
      cy.request({
        method: 'PUT',
        url: `/posts/${post.id}`,
        body: post
      }).then(response => {
        expect(response.status).to.be.equal(200);
        expect(response.body.id).to.be.equal(post.id);
        expect(response.body.userId).to.be.equal(post.userId);
        expect(response.body.title).to.be.equal(post.title);
        expect(response.body.body).to.be.equal(post.body);
      })
    })

  })

  it('9 - Delete non-existing post entity', () => {
    cy.request({
      method: 'DELETE',
      url: '/posts/9999',
      failOnStatusCode: false,

    }).then(response => {
      expect(response.status).to.be.equal(404);
    })
  })

  it('10 - Create post entity', () => {
    post.id = '12345834347'
    cy.request({
      method: 'POST',
      url: '/posts',
      body: post
    }).then(response => {
      expect(response.status).to.be.equal(201);
      expect(response.body.userId).to.be.equal(post.userId);
      expect(response.body.title).to.be.equal(post.title);
      expect(response.body.body).to.be.equal(post.body);
    }).then(() => {

      post.userId = '987465123';
      post.body = 'json-server';
      post.title = 'typicode'

      cy.request({
        method: 'PUT',
        url: `/posts/${post.id}`,
        body: post
      }).then(response => {
        expect(response.status).to.be.equal(200);
        expect(response.body.userId).to.be.equal(post.userId);
        expect(response.body.title).to.be.equal(post.title);
        expect(response.body.body).to.be.equal(post.body);
      })

      cy.request({
        method: 'DELETE',
        url: `/posts/${post.id}`,
      }).then(response => {
        expect(response.status).to.be.equal(200);
        expect(response.body.id).to.be.equal(undefined);
      })

      cy.request({
        method: 'GET',
        url: `/posts/${post.id}`,
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.be.equal(404);
      })
    })
  })
})