#!/bin/bash

# make.sh -- simple bash script to make dev distribution (the default action) and actual distribution
# Created because gnu make doesn't work with spaces in the filenames!


copyfile () {
	if [ ! -e "$1" ];
	then
		echo "Hey, you didn't grab the $2 repo. You need to add the flag '--recurse=submodules' to your git clone command."
		exit 0
	fi
	echo "Copying $2 file to css directory"
	cp "$1" css/	
}

doallcopies () {
	copyfile "links/animate.css/animate.min.css" "Animate.css"
	copyfile "links/font-awesome/use-on-desktop/Font Awesome 5 Free-Solid-900.otf" "Font Awesome"
}

if [ "$1" == "" ];
then
	doallcopies
	echo "Done. Don't forget to check the css files for any external font files that might be used!"
else 
	if [ "$1" == "dist" ];
	then
		echo "making dist"
		doallcopies
		mkdir -p dist/
		cp index.html dist/
		cp -R css/ dist/
		cp -R js/ dist/
		echo "Done. Don't forget to check the css files for any external font files that might be used!"
	fi
fi

