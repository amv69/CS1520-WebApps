from flask import Flask, request, session, url_for, redirect, render_template, abort, g, flash
from app import *
from models import db, User, Book

#########################################################################################
# Utilities
#########################################################################################

# Given a username, gives
def get_user_id(username):
	rv = User.query.filter_by(username=username).first()
	return rv.user_id if rv else None
def get_book_title(title):
	rv = Book.query.filter_by(title=title).first()
	return rv.title if rv else None
# This decorator will cause this function to run at the beginning of each request,
# before any of the route functions run. We're using this to check if the user is
# logged in, so that we don't have to do that on every page.
@app.before_request
def before_request():
	# 'g' is a general-purpose global variable thing that Flask gives you.
	# it's a "magic global" like session, request etc. so it's useful
	# for storing globals that you only want to exist for one request.
	g.user = None
	if 'user_id' in session:
		g.user = User.query.filter_by(user_id=session['user_id']).first()

#########################################################################################
# User account management page routes
#########################################################################################

# This stuff is taken pretty much directly from the "minitwit" example.
# It's pretty standard stuff, so... I'm not gonna make you reimplement it.

@app.route('/login', methods=['GET', 'POST'])
def login():
	"""Logs the user in."""
	if g.user:
		return redirect(url_for('home'))
	error = None
	if request.method == 'POST':

		user = User.query.filter_by(username=request.form['username']).first()
		if user is None:
			error = 'Invalid username'
		elif user.password != request.form['password']:
			error = 'Invalid password'
		else:
			flash('You were logged in')
			session['user_id'] = user.user_id
			return redirect(url_for('home'))

	return render_template('login.html', error=error)

@app.route('/register', methods=['GET', 'POST'])
def register():
	"""Registers the user."""
	if g.user:
		return redirect(url_for('home'))

	error = None
	if request.method == 'POST':
		if not request.form['username']:
			error = 'You have to enter a username'
		elif not request.form['email'] or '@' not in request.form['email']:
			error = 'You have to enter a valid email address'
		elif not request.form['password']:
			error = 'You have to enter a password'
		elif request.form['password'] != request.form['password2']:
			error = 'The two passwords do not match'
		elif get_user_id(request.form['username']) is not None:
			error = 'The username is already taken'
		else:
			db.session.add(User(
				username = request.form['username'],
				email = request.form['email'],
				password = request.form['password'],
				librarian = False))
			db.session.commit()
			flash('You were successfully registered! Please log in.')
			return redirect(url_for('login'))

	return render_template('register.html', error=error)

@app.route('/logout')
def logout():
	"""Logs the user out."""
	flash('You were logged out. Thanks!')
	session.pop('user_id', None)
	return redirect(url_for('home'))

#########################################################################################
# Other page routes
#########################################################################################

# The home page shows a listing of books.
@app.route('/', methods=['GET', 'POST'])
def home():
	allBooks = Book.query.order_by(Book.title).all()
	if request.method == 'POST':
		somebook = Book.query.filter_by(book_id=request.form.get('book_id')).first()
		if somebook in g.user.borrows:
			g.user.borrows.remove(somebook)
			db.session.commit()
			
		else:
			g.user.borrows.append(somebook)
			db.session.commit()


	return render_template('home.html', allBooks = allBooks)

@app.route('/books/', methods=['POST', 'GET'])
@app.route('/books/<book_id>')
def books(book_id=None):
	if g.user.librarian:
		if request.method == 'POST':
			if not request.form['title']:
				error = 'You have to enter a title'
			elif not request.form['author']:	
				error = 'You have to enter an author'
			elif not request.form['book_id']:
				error = 'You have to enter a book ID'
			elif get_book_title(request.form['title']) is not None:
				error = 'The Book already exists'
			else:
				db.session.add(Book(
				title = request.form['title'],
				author = request.form['author'],
				book_id = request.form['book_id']))
				db.session.commit()
				flash('Book successfully added')
				return redirect(url_for('home'))
			

	else:
		flash('You Need to be logged in')
		session['user_id'] = user.user_id
		return redirect(url_for('home'))

	return render_template('books.html')
	
def books(book_id):
	somebook = Book.query.filter_by(book_id = book_id).first()
	users = User.query.filter_by(User.user_id).all()
	numberOfBorrows = 0
	if somebook is None:
		abort(404)
	for user in users:
		if somebook in user.borrows:
			numberOfBorrows += 1

	return render_template('book.html', somebook = somebook, numberOfBorrows = numberOfBorrows)
	







"""
@app.route('/borrow', methods=['POST'])
def borrow():
	allBooks = Book.query.order_by(Book.title).all()
	someBook = request.form.get('book_id')
	g.user.borrows.append(someBook)
	print('book borrowd')
	return render_template('home.html', allBooks = allBooks)

@app.route('/returns', methods=['POST'])
def returns():
	allBooks = Book.query.order_by(Book.title).all()
	someBook = request.form.get('book_id')
	g.user.borrows.remove(someBook)
	print('book returned')
	return render_template('home.html', allBooks = allBooks)
"""